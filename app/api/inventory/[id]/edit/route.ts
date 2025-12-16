import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { quantity, unit, pricePerUnit } = body;

    if (quantity === undefined || unit === undefined || pricePerUnit === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating inventory:", err);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
