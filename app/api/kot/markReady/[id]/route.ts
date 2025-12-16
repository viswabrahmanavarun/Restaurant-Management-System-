// app/api/kot/markReady/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEventsToAll } from "@/lib/sse";  // 🔥 push live updates to kitchen/queue/orders

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "KOT ID missing" },
        { status: 400 }
      );
    }

    // ✅ Update item KOT to READY
    const kot = await prisma.kOT.update({
      where: { id },
      data: { kotStatus: "READY" },
      include: {
        order: {
          include: {
            items: {
              include: { menuItem: true },
            },
            kots: true,
          },
        },
      },
    });

    // If KOT not found
    if (!kot) {
      return NextResponse.json(
        { success: false, error: "KOT not found" },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // 🚀 Check if ALL items for this order are READY
    // -------------------------------------------------
    const remaining = kot.order.kots.filter((k) => k.kotStatus !== "READY");

    if (remaining.length === 0) {
      // All items ready → Order becomes READY
      await prisma.order.update({
        where: { id: kot.orderId },
        data: { status: "READY" },
      });
    }

    // -------------------------------------------------
    // 🔥 Send Live Update to all SSE clients
    // -------------------------------------------------
    const refreshedOrder = await prisma.order.findUnique({
      where: { id: kot.orderId },
      include: {
        items: { include: { menuItem: true } },
        kots: true,
      },
    });

    sendEventsToAll({
      type: "ORDER_UPDATED",
      payload: refreshedOrder,
    });

    return NextResponse.json({
      success: true,
      message: "KOT marked as READY",
    });
  } catch (error) {
    console.error("❌ Error marking KOT ready:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update KOT" },
      { status: 500 }
    );
  }
}
