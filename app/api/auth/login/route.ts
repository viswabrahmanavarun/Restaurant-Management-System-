import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Missing email, password or role" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check role
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Incorrect role selected" },
        { status: 401 }
      );
    }

    // Compare password (hashed only for Ramu)
    let validPassword = false;

    if (user.password.startsWith("$2b$")) {
      validPassword = await bcrypt.compare(password, user.password);
    } else {
      validPassword = user.password === password;
    }

    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // SUCCESS → return correct userId
    return NextResponse.json({
      success: true,
      message: "Login successful",
      userId: user.id,  // ⭐ THE FIX
      role: user.role,
      name: user.name,
    });

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
