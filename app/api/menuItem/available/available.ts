import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/menuItem/available
 *
 * Returns all AVAILABLE menu items with full information
 * including soldToday, soldThisWeek, rating, image etc.
 */
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        available: true, // only available items
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
        prepTime: true,
        soldToday: true,       // ✅ added
        soldThisWeek: true,    // ✅ added
        rating: true,          // ⭐ rating
        image: true,           // 🖼️ image url
        vegetarian: true,      // veg / non-veg
        spicy: true,           // 🔥 spicy tag
        popular: true,         // ⭐ popular tag
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("❌ Failed to load available menu items:", err);
    return NextResponse.json(
      { error: "Failed to fetch available items" },
      { status: 500 }
    );
  }
}
