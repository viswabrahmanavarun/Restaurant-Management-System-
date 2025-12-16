// /app/api/orders/new/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type NewOrderItem = {
  menuItemId: string;
  quantity: number;
};

async function generateOrderNumber() {
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  if (!last || !last.orderNumber) return "ORD-001";

  const lastNum = Number(last.orderNumber.replace("ORD-", "")) || 0;
  const next = (lastNum + 1).toString().padStart(3, "0");
  return `ORD-${next}`;
}

async function generateKOTNumber() {
  const last = await prisma.kOT.findFirst({
    orderBy: { createdAt: "desc" },
    select: { kotNumber: true },
  });

  if (!last || !last.kotNumber) return "KOT-001";

  const lastNum = Number(last.kotNumber.replace("KOT-", "")) || 0;
  const next = (lastNum + 1).toString().padStart(3, "0");
  return `KOT-${next}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, tableNumber, items } = body;

    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    for (const it of items) {
      if (!it.menuItemId || typeof it.menuItemId !== "string") {
        return NextResponse.json(
          { error: "Each item must contain a valid menuItemId" },
          { status: 400 }
        );
      }

      if (typeof it.quantity !== "number" || it.quantity <= 0) {
        return NextResponse.json(
          { error: "Quantity must be a valid positive number" },
          { status: 400 }
        );
      }
    }

    const menuIds = items.map((i) => i.menuItemId);
    const uniqueMenuIds = [...new Set(menuIds)];

    const menuRecords = await prisma.menuItem.findMany({
      where: { id: { in: uniqueMenuIds } },
    });

    const foundIds = new Set(menuRecords.map((m) => m.id));
    const missing = uniqueMenuIds.filter((id) => !foundIds.has(id));

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "One or more menu items were not found",
          missingIds: missing,
        },
        { status: 400 }
      );
    }

    const menuById = new Map(menuRecords.map((m) => [m.id, m]));
    let total = 0;

    const orderItemsCreate = items.map((it) => {
      const menu = menuById.get(it.menuItemId)!;
      const price = menu.price ?? 0;

      total += price * it.quantity;

      return {
        itemName: menu.name,
        quantity: it.quantity,
        price,
        imageUrl: menu.image ?? null,
        menuItemId: it.menuItemId,
      };
    });

    const orderNumber = await generateOrderNumber();
    const kotNumber = await generateKOTNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        tableNumber: tableNumber || null,
        totalAmount: total,
        status: "NEW",

        items: {
          create: orderItemsCreate.map((oi) => ({
            ...oi,
            kotStatus: "IN_QUEUE",
          })),
        },

        kots: {
          create: {
            kotNumber,
            status: "NEW",
          },
        },
      },

      include: {
        items: true,
        kots: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("❌ Error creating new order:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
