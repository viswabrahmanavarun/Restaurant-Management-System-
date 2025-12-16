// app/api/kot/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastEvent } from "@/lib/sse";

type Params = {
  params: { id: string };
};

export async function PATCH(req: Request, { params }: Params) {
  try {
    const kotId = params.id;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: "status is required" }, { status: 400 });
    }

    const updatedKOT = await prisma.kOT.update({
      where: { id: kotId },
      data: { status },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    // sync order status
    try {
      await prisma.order.update({
        where: { id: updatedKOT.orderId },
        data: { status },
      });
    } catch (err) {
      console.warn("Failed to sync order status:", err);
    }

    // broadcast to SSE clients
    broadcastEvent({ type: "kot_update", kot: updatedKOT });

    return NextResponse.json({ success: true, kot: updatedKOT });
  } catch (error: any) {
    console.error("PATCH /api/kot/[id] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
