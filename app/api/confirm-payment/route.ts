// app/api/confirm-payment/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      createdOrderId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      cart,
      customerName,
      customerPhone,
      total,
      paymentMethod,
      tableNumber, // optional
    } = body;

    /* ---------------------------------------------------
       1. VERIFY SIGNATURE
    --------------------------------------------------- */
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET || "fgvlUYolOLsYixkYm1SgCiO7";

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const signatureIsValid = generatedSignature === razorpaySignature;

    /* ---------------------------------------------------
       2. ORDER STATUS & TYPE LOGIC
       - Public orders must stay TAKE_AWAY
       - Status must be an OrderStatus enum
    --------------------------------------------------- */
    const statusToSet = signatureIsValid ? "PLACED" : "PAYMENT_PENDING";

    /* ---------------------------------------------------
       3. UPDATE ORDER
    --------------------------------------------------- */
    const updatedOrder = await prisma.order.update({
      where: { id: createdOrderId },
      data: {
        paymentStatus: signatureIsValid ? "PAID" : "FAILED",
        razorpayPaymentId,
        razorpaySignature,
        finalAmount: Number(total) || undefined,
        customerName,
        tableNumber: tableNumber || null,

        // ⭐ FIXED — MUST BE OrderStatus enum
        status: statusToSet,

        // ⭐ FIXED — TAKE_AWAY is part of OrderType, not OrderStatus
        orderType: "TAKE_AWAY",
      },
    });

    /* ---------------------------------------------------
       4. RECREATE ORDER ITEMS
    --------------------------------------------------- */
    if (Array.isArray(cart) && cart.length > 0) {
      await prisma.orderItem.deleteMany({
        where: { orderId: createdOrderId },
      });

      await Promise.all(
        cart.map((c: any) =>
          prisma.orderItem.create({
            data: {
              itemName: c.item.name,
              quantity: c.qty,
              price: c.item.price,
              imageUrl: c.item.image || null,
              orderId: createdOrderId,
            },
          })
        )
      );
    }

    /* ---------------------------------------------------
       5. CREATE PAYMENT RECORD
    --------------------------------------------------- */
    await prisma.payment.create({
      data: {
        status: signatureIsValid ? "PAID" : "FAILED",
        amount: Number(total) || 0,
        mode:
          paymentMethod === "CARD"
            ? "CreditCard"
            : paymentMethod === "UPI"
            ? "UPI"
            : "Cash",

        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        paymentLinkId: razorpayOrderId,

        orderId: updatedOrder.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified & order updated",
      order: updatedOrder,
    });
  } catch (err: any) {
    console.error("confirm-payment error:", err);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
