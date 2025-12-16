import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 🟢 GET - Fetch all inventory items
export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

// 🟠 POST - Add a new inventory item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      quantity,
      unit,
      pricePerUnit,
      threshold,
      supplier,
      imageUrl,
    } = body;

    const newItem = await prisma.inventory.create({
      data: {
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        threshold: parseFloat(threshold),
        supplier: supplier || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error adding inventory:", error);
    return NextResponse.json({ error: "Failed to add inventory" }, { status: 500 });
  }
}
