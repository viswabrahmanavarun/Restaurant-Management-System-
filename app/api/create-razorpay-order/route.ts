// app/api/create-razorpay-order/route.ts
import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ============================================================
   Razorpay Init
============================================================ */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RJTIkfZuG26cqc",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "fgvlUYolOLsYixkYm1SgCiO7",
});

/* ============================================================
   Generate Unique Order Number → ORD-001, ORD-002…
============================================================ */
async function generateOrderNumber() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder || !lastOrder.orderNumber) return "ORD-001";

  const lastNum = Number(lastOrder.orderNumber.replace("ORD-", ""));
  const next = (lastNum + 1).toString().padStart(3, "0");

  return `ORD-${next}`;
}

/* ============================================================
   MAIN POST HANDLER
============================================================ */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      cart,
      subtotal,
      discount,
      total,
      customerName,
      customerPhone,
      tableNumber,
      paymentMethod,
    } = body;

    // ⭐ Generate Order Number
    const orderNumber = await generateOrderNumber();

    /* ============================================================
       1️⃣ COD ORDERS
    ============================================================= */
    if (paymentMethod === "COD") {
      const createdOrder = await prisma.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          tableNumber: tableNumber || null,
          totalAmount: Number(total),
          subtotal: Number(subtotal),
          discount: Number(discount),
          paymentMethod: "Cash",
          paymentStatus: "PENDING",
          status: "PLACED",
          orderType: "TAKE_AWAY",
        },
      });

      if (Array.isArray(cart)) {
        await Promise.all(
          cart.map((c: any) =>
            prisma.orderItem.create({
              data: {
                itemName: c.item.name,
                quantity: c.qty,
                price: c.item.price,
                imageUrl: c.item.image || null,
                orderId: createdOrder.id,
              },
            })
          )
        );
      }

      return NextResponse.json({
        cod: true,
        createdOrderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
      });
    }

    /* ============================================================
       2️⃣ ONLINE ORDERS
    ============================================================= */
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        tableNumber: tableNumber || null,
        totalAmount: Number(total),
        subtotal: Number(subtotal),
        discount: Number(discount),
        paymentMethod: paymentMethod === "CARD" ? "CreditCard" : "UPI",
        paymentStatus: "PENDING",
        status: "PAYMENT_PENDING",
        orderType: "TAKE_AWAY",
      },
    });

    if (Array.isArray(cart)) {
      await Promise.all(
        cart.map((c: any) =>
          prisma.orderItem.create({
            data: {
              itemName: c.item.name,
              quantity: c.qty,
              price: c.item.price,
              imageUrl: c.item.image || null,
              orderId: createdOrder.id,
            },
          })
        )
      );
    }

    /* ============================================================
       3️⃣ CREATE RAZORPAY ORDER
    ============================================================= */
    const amountPaise = Math.round(Number(total) * 100);

    const rOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: createdOrder.id,
      notes: {
        orderNumber,
        customerName,
        customerPhone,
        tableNumber,
      },
    });

    await prisma.order.update({
      where: { id: createdOrder.id },
      data: { razorpayLinkId: rOrder.id },
    });

    return NextResponse.json({
      razorpayOrderId: rOrder.id,
      amount: rOrder.amount,
      currency: rOrder.currency,
      orderId: createdOrder.id,
      orderNumber,
    });
  } catch (err: any) {
    console.error("create-razorpay-order error:", err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
