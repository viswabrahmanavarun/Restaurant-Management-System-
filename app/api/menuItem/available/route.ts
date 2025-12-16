// /app/api/menuItem/available/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";

    const menuItems = await prisma.menuItem.findMany({
      where: {
        available: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        name: true,
        price: true,
        vegetarian: true,
        image: true,
        rating: true,
        reviews: true,
      },
    });

    return NextResponse.json({
      success: true,
      items: menuItems,
    });
  } catch (err) {
    console.error("ERROR /menuItem/available:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
