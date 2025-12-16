import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🟡 PUT - Update a supplier
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, contactPerson, phone, email, category, notes } = body;

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        name,
        contactPerson,
        phone,
        email,
        category,
        notes,
      },
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

// 🔴 DELETE - Remove a supplier
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.supplier.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
