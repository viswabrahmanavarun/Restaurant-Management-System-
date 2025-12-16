import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET → Fetch minimum rating allowed
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "reviewSettings" },
    });

    const minRating = setting?.value?.minRatingAllowed ?? 1; // default to 1 if not set

    return NextResponse.json({ minRating });
  } catch (error) {
    console.error("❌ Error fetching min rating:", error);
    return NextResponse.json(
      { message: "Error fetching min rating", error },
      { status: 500 }
    );
  }
}
