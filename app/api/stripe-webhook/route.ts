import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20", // Use stable version
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session: any = event.data.object;

  if (event.type === "checkout.session.completed") {
    try {
      const tableNumber = String(session.metadata?.tableNumber || "");
      const items = JSON.parse(session.metadata?.items || "[]");

      // 1. Create Order
      const order = await prisma.order.create({
        data: {
          tableNumber,
          status: OrderStatus.NEW, // FIXED — must match your Prisma ENUM
        },
      });

      // 2. Create Order Items
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
          },
        });
      }

      // 3. Create Payment Entry
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: Number(session.amount_total) / 100,
          method: session.payment_method_types?.[0] || "stripe",
          status: "PAID",
        },
      });
    } catch (error) {
      console.error("Webhook process error:", error);
      return new NextResponse("Webhook Error", { status: 500 });
    }
  }

  return new NextResponse("OK", { status: 200 });
}
