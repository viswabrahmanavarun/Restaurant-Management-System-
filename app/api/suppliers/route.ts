import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🟢 GET - Fetch all suppliers
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

// 🟠 POST - Add a new supplier
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contactPerson, phone, email, category, notes } = body;

    const newSupplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson,
        phone,
        email,
        category,
        notes: notes || null,
      },
    });

    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error("Error adding supplier:", error);
    return NextResponse.json({ error: "Failed to add supplier" }, { status: 500 });
  }
}
