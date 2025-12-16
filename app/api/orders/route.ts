import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEvent } from "@/lib/sse";

/* =====================================================
   Utility: Generate Unique Numbers
===================================================== */
async function generateUniqueOrderNumber() {
  let number = 1;
  while (true) {
    const orderNumber = `ORD-${String(number).padStart(3, "0")}`;
    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    if (!existing) return orderNumber;
    number++;
  }
}

async function generateUniqueKOTNumber() {
  let number = 1;
  while (true) {
    const kotNumber = `KOT-${String(number).padStart(3, "0")}`;
    const existing = await prisma.kOT.findUnique({ where: { kotNumber } });
    if (!existing) return kotNumber;
    number++;
  }
}

async function generateUniqueInvoiceNumber() {
  let number = 1;
  while (true) {
    const invoiceNumber = `INV-${String(number).padStart(3, "0")}`;
    const existing = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!existing) return invoiceNumber;
    number++;
  }
}

/* =====================================================
   Helper: Auto Image Mapper
===================================================== */
function getImageFileName(menuItem: string | null | undefined): string {
  if (!menuItem) return "default-food.jpg";

  const normalized = menuItem.toLowerCase().trim();
  const imageMap: Record<string, string> = {
    "panner butter masala": "paneer-butter-masala.jpg",
    "panner fried rice": "paneer-fried-rice.jpg",
    "chicken 65": "chicken-65.jpg",
    burger: "burger.jpg",
    dhokla: "dhokla.jpg",
    "fried mushroom": "fried-mushroom.jpg",
    "hot chocolate": "hot-chocolate.jpg",
    "kaju katli": "kaju-katli.jpg",
  };

  return imageMap[normalized] || `${normalized.replace(/\s+/g, "-")}.jpg`;
}

/* =====================================================
   POST → Create Order + Auto KOT Generation
===================================================== */
export async function POST(req: Request) {
  try {
    const { customerName, totalAmount, items, tableNumber = null } =
      await req.json();

    if (!customerName || !items || !items.length) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const orderNumber = await generateUniqueOrderNumber();
    const kotNumber = await generateUniqueKOTNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        tableNumber, // ⭐ PROPER TABLE NUMBER SAVED
        totalAmount,
        status: "NEW",
        items: {
          create: items.map((i: any) => ({
            itemName: i.menuItem,
            quantity: i.quantity,
            price: i.price,
            imageUrl: i.imageUrl || `/images/${getImageFileName(i.menuItem)}`,
          })),
        },
        kots: {
          create: {
            kotNumber,
            status: "NEW",
          },
        },
      },
      include: { items: true, kots: true },
    });

    // Push live update
    sendEvent({ type: "NEW_ORDER", payload: order });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}

/* =====================================================
   PATCH → Update Order Status + Auto Invoice Generation
===================================================== */
export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    if (status === "COMPLETED") {
      const existingInvoice = await prisma.invoice.findFirst({
        where: { orderId },
      });

      if (!existingInvoice) {
        const subtotal = updatedOrder.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const tax = subtotal * 0.05;
        const serviceCharge = subtotal * 0.02;
        const discount = 0;
        const total = subtotal + tax + serviceCharge;

        await prisma.invoice.create({
          data: {
            invoiceNumber: await generateUniqueInvoiceNumber(),
            orderId,
            customerName: updatedOrder.customerName,
            tableNumber: updatedOrder.tableNumber ?? null,
            paymentMode: "Cash",
            paymentStatus: "Paid",
            subtotal,
            tax,
            serviceCharge,
            discount,
            total,
          },
        });
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}

/* =====================================================
   GET → Fetch All Orders (Dashboard + Kitchen)
===================================================== */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        kots: true,
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const updatedOrders = orders.map((order) => {
      const invoice = order.invoices?.[0] || null;

      return {
        ...order,
        // Normalized fields for frontend
        tax: invoice?.tax ?? 0,
        discount: invoice?.discount ?? 0,
        serviceCharge: invoice?.serviceCharge ?? 0,
        createdAt: order.createdAt,

        // Items cleanup
        items: order.items.map((item) => ({
          ...item,
          imageUrl:
            item.imageUrl ||
            `/images/${getImageFileName(item.itemName)}`, // ⭐ FIXED IMAGE MAPPING
        })),
      };
    });

    return NextResponse.json({ success: true, orders: updatedOrders });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
