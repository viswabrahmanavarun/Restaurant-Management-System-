import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert Date objects to ISO strings
    const formatted = reservations.map(r => ({
      ...r,
      date: r.date ? r.date.toISOString() : null,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
