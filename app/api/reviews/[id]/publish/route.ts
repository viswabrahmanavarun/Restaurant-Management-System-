import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { getServerSession } from "next-auth"; // uncomment if you use next-auth

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // ✅ Optional: restrict to admin role (example)
    // const session = await getServerSession();
    // if (session?.user?.role !== "ADMIN") {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    // }

    // ✅ Update review status to PUBLISHED
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    return NextResponse.json({
      success: true,
      message: "Review published successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("❌ Error publishing review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish review" },
      { status: 500 }
    );
  }
}
