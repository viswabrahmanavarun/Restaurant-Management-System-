// /app/api/orders/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEvent } from "@/lib/sse";

/* ------------------------------------------------------------
   KOT STATUS MAPPING
------------------------------------------------------------ */
const mapOrderStatusToKOT = (status: string) => {
  switch (status) {
    case "NEW":
      return "IN_QUEUE";
    case "IN_QUEUE":
      return "IN_QUEUE";
    case "READY":
      return "READY";
    case "COMPLETED":
      return "COMPLETED";
    default:
      return "IN_QUEUE";
  }
};

/* ------------------------------------------------------------
   GET → Fetch Single Order (menuItemId normalized to string)
------------------------------------------------------------ */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          select: {
            id: true,
            itemName: true,
            quantity: true,
            price: true,
            menuItemId: true,
            imageUrl: true,
            kotStatus: true,
          },
        },
        kots: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const totalAmount = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ⭐ FIX — Convert menuItemId ObjectId → string
    const fixedItems = order.items.map((item) => ({
      ...item,
      menuItemId: item.menuItemId ? String(item.menuItemId) : null,
    }));

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: fixedItems,
        totalAmount,
        customerName: order.customerName || "Unknown Customer",
      },
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   PATCH → Update Order Status
------------------------------------------------------------ */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Missing status field" },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    /* ------------------------------------------------------------
       PAYMENT_PENDING → Create Payment Row
    ------------------------------------------------------------ */
    if (status === "PAYMENT_PENDING") {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      const totalAmount = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      updateData.payment = {
        upsert: {
          where: { orderId: id },
          update: { status: "PENDING", amount: totalAmount },
          create: { status: "PENDING", amount: totalAmount },
        },
      };

      updateData.kots = {
        updateMany: {
          where: { orderId: id },
          data: { status: "READY" },
        },
      };
    }

    /* ------------------------------------------------------------
       PAYMENT_COMPLETED → Mark Order as Completed + Trigger Review Popup
    ------------------------------------------------------------ */
    else if (status === "PAYMENT_COMPLETED") {
      updateData.payment = {
        update: { status: "PAID" },
      };

      updateData.status = "COMPLETED";

      // ⭐ Trigger frontend to open review add page
      sendEvent({
        type: "REVIEW_READY",
        payload: { orderId: id },
      });
    }

    /* ------------------------------------------------------------
       NORMAL STATUS UPDATE
    ------------------------------------------------------------ */
    else {
      updateData.kots = {
        updateMany: {
          where: { orderId: id },
          data: {
            status: mapOrderStatusToKOT(status),
          },
        },
      };

      await prisma.orderItem.updateMany({
        where: { orderId: id },
        data: {
          kotStatus: mapOrderStatusToKOT(status),
        },
      });
    }

    /* ------------------------------------------------------------
       UPDATE ORDER
    ------------------------------------------------------------ */
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          select: {
            id: true,
            itemName: true,
            quantity: true,
            price: true,
            menuItemId: true,
            imageUrl: true,
            kotStatus: true,
          },
        },
        kots: true,
        payment: true,
      },
    });

    const totalAmount = updatedOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ⭐ FIX — Normalize menuItemId here too
    const fixedItems = updatedOrder.items.map((item) => ({
      ...item,
      menuItemId: item.menuItemId ? String(item.menuItemId) : null,
    }));

    sendEvent({
      type: "ORDER_UPDATED",
      payload: updatedOrder,
    });

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        items: fixedItems,
        totalAmount,
        customerName:
          updatedOrder.customerName || "Unknown Customer",
      },
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
