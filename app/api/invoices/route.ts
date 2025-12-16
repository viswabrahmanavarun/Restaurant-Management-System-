import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ===============================
// Utility → Generate Unique Invoice Number
// ===============================
async function generateUniqueInvoiceNumber(isManual: boolean = false) {
  let number = 1;
  const prefix = isManual ? "INV-M" : "INV-";
  let invoiceNumber = "";

  while (true) {
    invoiceNumber = `${prefix}${String(number).padStart(3, "0")}`;
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
    if (!existing) break;
    number++;
  }

  return invoiceNumber;
}

// ===============================
// POST → Create a new invoice (manual or from order)
// ===============================
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      customerName,
      tableNumber,
      modeOfPayment,
      subTotal,
      tax,
      serviceCharge,
      totalAmount,
      items = [],
      orderId,
    } = data;

    const invoiceNumber = await generateUniqueInvoiceNumber(true);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName,
        tableNumber,
        modeOfPayment,
        subTotal,
        tax,
        serviceCharge,
        totalAmount,
        status: orderId ? "ORDER_BASED" : "MANUAL",
        orderId: orderId || null,
        items: {
          create: items.map((item: any) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
        order: {
          select: {
            status: true, // ✅ Fetch order status
          },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// ===============================
// GET → Fetch all invoices (with items and order status)
// ===============================
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
        order: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Flatten the order status to `orderStatus` for easier frontend usage
    const formatted = invoices.map((inv) => ({
      ...inv,
      orderStatus: inv.order?.status || "MANUAL",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
