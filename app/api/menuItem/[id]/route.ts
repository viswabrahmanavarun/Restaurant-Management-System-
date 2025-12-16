import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ObjectId } from "bson";

// ===============================
// GET — Fetch single menu item
// ===============================
export async function GET(req, { params }) {
  try {
    const id = new ObjectId(params.id);

    const item = await prisma.menuItem.findUnique({
      where: { id },

      // ⭐ ONLY SHOW PUBLISHED REVIEWS IN PUBLIC MENU ⭐
      include: {
        menuReviews: {
          where: { status: "PUBLISHED" },     // Show only published reviews
          orderBy: { createdAt: "desc" },     // Latest review first
        },
      },
    });

    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ===============================
// PUT — Update menu item
// ===============================
export async function PUT(req, { params }) {
  try {
    const id = new ObjectId(params.id);
    const data = await req.json();

    const updated = await prisma.menuItem.update({
      where: { id },
      data,

      // Include reviews for admin/edit screen
      include: {
        menuReviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ===============================
// DELETE — Remove menu item
// ===============================
export async function DELETE(req, { params }) {
  try {
    const id = new ObjectId(params.id);

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
