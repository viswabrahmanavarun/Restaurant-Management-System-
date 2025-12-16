import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch reviews but DO NOT include relation directly
    const rawReviews = await prisma.review.findMany({
      where: {
        OR: [{ status: "PUBLISHED" }, { status: "SPAM" }],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!rawReviews.length)
      return NextResponse.json({ success: true, reviews: [] });

    // Map orderIds
    const orderIds = rawReviews.map((r) => r.orderId);

    // Fetch all related orders at once
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { items: true },
    });

    const orderMap: any = {};
    orders.forEach((o) => (orderMap[o.id] = o));

    const safeReviews = rawReviews
      .map((r) => {
        const order = orderMap[r.orderId];
        if (!order) return null; // 🚫 Skip broken review instead of crashing

        const orderDetails = {
          items: order.items,
          totalAmount: order.items.reduce(
            (sum, it) => sum + it.price * it.quantity,
            0
          ),
        };

        return {
          ...r,
          orderDetails,
          orderNumber:
            order.orderNumber ||
            `ORD-${String(order.id).slice(-3).padStart(3, "0")}`,
        };
      })
      .filter(Boolean); // Remove nulls

    return NextResponse.json({
      success: true,
      reviews: safeReviews,
    });
  } catch (error) {
    console.error("❌ Error fetching published reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch published reviews" },
      { status: 500 }
    );
  }
}
