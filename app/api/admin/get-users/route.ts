import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    // Convert MongoDB ObjectId → string
    const safeUsers = users.map((u) => ({
      ...u,
      id: typeof u.id === "string" ? u.id : u.id.toString(),
      createdAt: u.createdAt ?? new Date(0),
    }));

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
