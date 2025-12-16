import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const { id, customerName, phone, guests, date, time, table, status } = body;
    if (!id || !customerName || !phone || !guests || !date || !time || !table || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create reservation in database
    const reservation = await prisma.reservation.create({
      data: {
        id, // front-end generated ID (RES-XXX)
        customerName,
        email: body.email || null,
        phone,
        guests: Number(guests),
        date: new Date(date), // ensures date string converts to Date object
        time,
        table,
        status,
        specialRequests: body.specialRequests || null,
        createdAt: new Date(), // ensures createdAt is set
      },
    });

    // Return the created reservation for frontend
    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    console.error("Reservation creation error:", err);
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
