import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, phone, gender, address, image } =
      await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (exists) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    /* ====================================
            SAFE UNIQUE staffId Generator
    ===================================== */
    const prefixMap: Record<string, string> = {
      admin: "A",
      manager: "M",
      chef: "C",
      waiter: "W",
    };

    const prefix = prefixMap[role.toLowerCase()] || "S";

    const users = await prisma.user.findMany({
      where: {
        staffId: {
          startsWith: prefix + "-",
        },
      },
      select: { staffId: true },
    });

    const usedNumbers = users
      .map((u) => Number(u.staffId?.split("-")[1]))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    let nextNum = 1;
    for (const n of usedNumbers) {
      if (n === nextNum) nextNum++;
      else break;
    }

    const staffId = `${prefix}-${String(nextNum).padStart(2, "0")}`;

    /* ====================================
                  CREATE USER
    ===================================== */
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        staffId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role.toLowerCase(),
        phone,
        gender,
        address,
        image,
      },
    });

    /* ====================================
                SEND WELCOME EMAIL
    ===================================== */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const restaurantName = process.env.RESTAURANT_NAME || "Your Restaurant";
    const loginUrl = process.env.LOGIN_URL || "#";

    await transporter.sendMail({
      from: `"${restaurantName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to ${restaurantName} - Your Account is Ready`,
      html: `
        <h2>Hello ${name},</h2>

        <p>Your staff account has been created successfully for 
        <strong>${restaurantName}</strong>.</p>

        <h3>Your Login Details</h3>
        <p><strong>Staff ID:</strong> ${staffId}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> ${role}</p>

        <h3>Restaurant Info</h3>
        <p><strong>Restaurant:</strong> ${restaurantName}</p>

        <br />
        <p>You can log in using the link below:</p>
        <a href="${loginUrl}" 
           style="padding:10px 20px;background:#ff6a00;color:white;text-decoration:none;border-radius:5px;">
           Login Now
        </a>

        <br/><br/>
        <p>Best Regards,<br/>${restaurantName} Team</p>
      `,
    });

    return NextResponse.json(
      { message: "User created & email sent successfully", user },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
