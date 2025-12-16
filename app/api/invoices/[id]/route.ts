import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ Await params
  try {
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
