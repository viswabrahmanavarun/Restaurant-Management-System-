import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✏️ PUT - Update inventory (edit quantity, unit, pricePerUnit)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { quantity, unit, pricePerUnit } = body;

    const updatedItem = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

// 🗑️ DELETE - Remove inventory item
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.inventory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json({ error: "Failed to delete inventory" }, { status: 500 });
  }
}
