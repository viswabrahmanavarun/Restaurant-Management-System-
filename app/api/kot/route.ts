import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ===============================
// GET /api/kitchen
// ===============================
export async function GET() {
  try {
    const kots = await prisma.kOT.findMany({
      include: {
        order: {
          include: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, kots });
  } catch (error) {
    console.error("❌ Error fetching kitchen orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch kitchen data" },
      { status: 500 }
    );
  }
}

// ===============================
// PATCH /api/kitchen
// ===============================
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { kotId, status } = body;

    const kot = await prisma.kOT.update({
      where: { id: kotId },
      data: { status },
    });

    // Also update order status accordingly
    if (status === "IN_QUEUE") {
      await prisma.order.update({
        where: { id: kot.orderId },
        data: { status: "IN_QUEUE" },
      });
    } else if (status === "READY") {
      await prisma.order.update({
        where: { id: kot.orderId },
        data: { status: "READY" },
      });
    }

    return NextResponse.json({ success: true, kot });
  } catch (error) {
    console.error("❌ Error updating kitchen order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update kitchen order" },
      { status: 500 }
    );
  }
}
