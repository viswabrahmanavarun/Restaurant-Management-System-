import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SECTIONS = [
  "restaurantDetails",
  "tableSettings",
  "reservationSettings",
  "reviewSettings",
];

// ================================
// GET → Fetch all settings
// ================================
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, any> = {};

    SECTIONS.forEach((section) => {
      const setting = settings.find((s) => s.key === section);
      result[section] = setting?.value || {};
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching settings", error },
      { status: 500 }
    );
  }
}

// ================================
// POST → Save/update settings
// ================================
export async function POST(request: Request) {
  try {
    const data = await request.json();

    for (const key of SECTIONS) {
      const existing = await prisma.setting.findUnique({
        where: { key },
      });

      // ------------------------------
      // SAFE JSON MERGE (NO TS ERRORS)
      // ------------------------------
      const existingValue =
        typeof existing?.value === "object" &&
        existing?.value !== null &&
        !Array.isArray(existing?.value)
          ? existing.value
          : {};

      const incomingValue =
        typeof data[key] === "object" &&
        data[key] !== null &&
        !Array.isArray(data[key])
          ? data[key]
          : {};

      let mergedValue: Record<string, any> = {
        ...existingValue,
        ...incomingValue,
      };

      // -----------------------------------------
      // SPECIAL LOGIC FOR reviewSettings
      // -----------------------------------------
      if (key === "reviewSettings") {
        if (mergedValue.minRatingAllowed != null) {
          let rating = Number(mergedValue.minRatingAllowed);
          if (isNaN(rating)) rating = 1;

          mergedValue.minRatingAllowed = Math.min(Math.max(rating, 1), 5);
        }
      }

      // -----------------------------------------
      // SAVE (UPSERT)
      // -----------------------------------------
      await prisma.setting.upsert({
        where: { key },
        update: { value: mergedValue },
        create: { key, value: mergedValue },
      });
    }

    return NextResponse.json({
      message: "Settings saved successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error saving settings", error },
      { status: 500 }
    );
  }
}
