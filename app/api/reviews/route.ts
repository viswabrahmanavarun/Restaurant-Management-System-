// /app/api/reviews/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEvent } from "@/lib/sse";

/* ============================================================
   FETCH REVIEW SETTINGS
============================================================ */
async function getReviewSettings() {
  const settings = await prisma.setting.findUnique({
    where: { key: "reviewSettings" },
  });

  return settings ? (settings.value as any) : null;
}

/* ============================================================
   POST — CREATE REVIEW + UPDATE MENU ITEM RATING
   ⭐ MIN RATING CHECK REMOVED — ALL RATINGS ALLOWED (1–5)
============================================================ */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const reviewSettings = await getReviewSettings();

    // Even if settings exist, WE DO NOT ENFORCE minRatingAllowed ANYMORE
    const { enableReviews, autoApproveReviews } = reviewSettings || {
      enableReviews: "yes",
      autoApproveReviews: "yes",
    };

    if (enableReviews === "no") {
      return NextResponse.json(
        { success: false, error: "Reviews are disabled" },
        { status: 403 }
      );
    }

    let customerName = data.customerName || "Guest User";
    let orderId: string | null = null;

    /* ------------------------------------------------------------
       VALIDATE ORDER
    ------------------------------------------------------------- */
    if (data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: data.orderId },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }

      orderId = order.id;
      customerName = order.customerName;
    }

    /* ------------------------------------------------------------
       VALIDATE menuItemId
    ------------------------------------------------------------- */
    if (!data.menuItemId) {
      return NextResponse.json(
        { success: false, error: "menuItemId is required" },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: data.menuItemId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      );
    }

    const status =
      autoApproveReviews === "yes" ? "PUBLISHED" : "PENDING";

    /* ------------------------------------------------------------
       CREATE REVIEW (⭐ minRatingAllowed no longer checked)
    ------------------------------------------------------------- */
    const review = await prisma.review.create({
      data: {
        customerName,
        rating: Number(data.rating), // Accept 1–5 without restriction
        comment: data.comment,
        menuItemId: data.menuItemId,
        orderId: orderId,
        status,
      },
    });

    /* ------------------------------------------------------------
       RECALCULATE MENU ITEM RATING
    ------------------------------------------------------------- */
    const allReviews = await prisma.review.findMany({
      where: { menuItemId: data.menuItemId },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: data.menuItemId },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviews: totalReviews,
      },
    });

    /* ------------------------------------------------------------
       SSE BROADCAST
    ------------------------------------------------------------- */
    sendEvent({
      type: "REVIEW_ADDED",
      payload: {
        updatedMenuItem: {
          id: updatedMenuItem.id,
          rating: updatedMenuItem.rating,
          reviews: updatedMenuItem.reviews,
        },
      },
    });

    return NextResponse.json({
      success: true,
      review,
      updatedMenuItem,
    });
  } catch (error) {
    console.error("❌ Error creating review:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create review",
    });
  }
}

/* ============================================================
   GET — FETCH ALL REVIEWS (FULLY NORMALIZED)
============================================================ */
export async function GET() {
  try {
    const reviewSettings = await getReviewSettings();

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        menuItem: true,
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    const normalized = reviews.map((r) => {
      const order =
        r.order && r.order.items
          ? {
              ...r.order,
              id: r.order.id?.toString(),
              orderNumber: r.order.orderNumber,
              totalAmount: r.order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ),
              items: r.order.items.map((it) => ({
                ...it,
                id: it.id?.toString(),
                menuItemId: it.menuItemId ? it.menuItemId.toString() : null,
              })),
            }
          : null;

      return {
        ...r,
        id: r.id.toString(),
        menuItemId: r.menuItemId?.toString() ?? null,
        orderId: r.orderId?.toString() ?? null,
        order,
        orderNumber: order?.orderNumber ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      reviews: normalized,
      reviewSettings,
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return NextResponse.json({
      success: false,
      reviews: [],
      error: "Failed to fetch reviews",
    });
  }
}
