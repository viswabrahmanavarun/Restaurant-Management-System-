import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* ============================================================
   GET REVIEWS FOR A SPECIFIC MENU ITEM
   Returns:
   - avgRating
   - totalReviews
   - reviews[]
============================================================ */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const menuItemId = params.id;

    if (!menuItemId) {
      return NextResponse.json(
        { success: false, error: "Menu item ID is required" },
        { status: 400 }
      );
    }

    // Fetch all reviews for this item
    const reviews = await prisma.review.findMany({
      where: { menuItemId },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return NextResponse.json({
      success: true,
      menuItemId,
      avgRating: Number(avgRating.toFixed(1)),
      totalReviews,
      reviews,
    });
  } catch (error) {
    console.error("❌ Error fetching menu item reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}
