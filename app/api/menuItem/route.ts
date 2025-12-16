// app/api/menuItem/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// -------------------------
// GET MENU ITEMS (with reviews)
// -------------------------
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");

  try {
    const items = category
      ? await prisma.menuItem.findMany({
          where: { category },
          include: { menuReviews: true }, // ⭐ REQUIRED
        })
      : await prisma.menuItem.findMany({
          include: { menuReviews: true }, // ⭐ REQUIRED
        });

    const formatted = items.map((item) => ({
      ...item,
      image: item.image || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/menuItem ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

// -------------------------
// CREATE MENU ITEM
// -------------------------
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const item = await prisma.menuItem.create({
      data: {
        ...data,
        image: data.image || null,
      },
      include: {
        menuReviews: true, // ⭐ RETURN EMPTY REVIEWS ARRAY
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("POST /api/menuItem ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
