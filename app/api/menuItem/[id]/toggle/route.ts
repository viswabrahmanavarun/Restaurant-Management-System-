import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Toggle the availability
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        available: !item.available,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Toggle availability error:", error);
    return NextResponse.json(
      { error: "Failed to toggle availability" },
      { status: 500 }
    );
  }
}
