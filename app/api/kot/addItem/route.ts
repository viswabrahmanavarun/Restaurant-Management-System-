// app/api/kot/addItem/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEvent } from "@/lib/sse"; // same helper used by orders API

export async function POST(req: Request) {
  try {
    const { orderId, itemName, quantity, price } = await req.json();

    if (!orderId || !itemName || !quantity || !price) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Create new item inside order
    const newItem = await prisma.orderItem.create({
      data: {
        orderId,
        itemName,
        quantity,
        price,
        kotStatus: "NEW",
      },
    });

    // 2️⃣ Recalculate the order subtotal
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    const newTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3️⃣ Update Order Total
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
      include: { items: true },
    });

    // 4️⃣ Broadcast update via SSE
    sendEvent({
      type: "ORDER_UPDATED",
      payload: updatedOrder,
    });

    return NextResponse.json({
      success: true,
      message: "KOT item added successfully",
      item: newItem,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error adding KOT item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add KOT item",
      },
      { status: 500 }
    );
  }
}
