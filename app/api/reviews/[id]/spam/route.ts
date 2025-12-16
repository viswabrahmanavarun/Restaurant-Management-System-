import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { getServerSession } from "next-auth"; // optional role check

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // ✅ Optional: restrict to admin role
    // const session = await getServerSession();
    // if (session?.user?.role !== "ADMIN") {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    // }

    // ✅ Update review status to SPAM
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { status: "SPAM" },
    });

    return NextResponse.json({
      success: true,
      message: "Review marked as spam successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("❌ Error marking review as spam:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark review as spam" },
      { status: 500 }
    );
  }
}
