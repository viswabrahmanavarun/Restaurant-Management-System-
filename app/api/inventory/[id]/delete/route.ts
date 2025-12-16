import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.inventory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting inventory:", err);
    return NextResponse.json({ error: "Failed to delete inventory" }, { status: 500 });
  }
}
