import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { broadcastKOTs } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🧾 Update the KOT status to SERVED (ready for billing)
    const kot = await prisma.kOT.update({
      where: { id: params.id },
      data: { status: "SERVED" },
      include: {
        orderItems: true,
        order: {
          select: {
            tableNumber: true,
            totalAmount: true,
          },
        },
      },
    });

    // 🔥 Broadcast updated KOT to all connected kitchen dashboards via SSE
    broadcastKOTs(kot);

    return NextResponse.json({ success: true, kot });
  } catch (error) {
    console.error("❌ Error confirming ready for billing:", error);
    return NextResponse.json(
      { error: "Failed to update KOT status" },
      { status: 500 }
    );
  }
}
