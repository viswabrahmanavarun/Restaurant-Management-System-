import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ===== Clear existing data =====
  await prisma.payment.deleteMany();
  await prisma.kOTItem.deleteMany();
  await prisma.kOT.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.setting.deleteMany(); // Clear settings too

  // ===== Default Settings =====
  const defaultSettings = [
    {
      key: "restaurantDetails",
      value: {
        name: "",
        logo: "",
        address: "",
        contact: "",
        email: "",
        operatingHours: "",
      },
    },
    {
      key: "tableSettings",
      value: {
        numberOfTables: 0,
        tableNames: "",
        tableCapacity: 0,
      },
    },
    {
      key: "reservationSettings",
      value: {
        maxGuests: 0,
        timeSlots: "",
        confirmationType: "manual",
        cancellationPolicy: "",
        advanceBookingLimit: 0,
      },
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // ===== Orders =====
  const order1 = await prisma.order.create({
    data: {
      customerName: "Rahul Sharma",
      totalAmount: 450,
      status: "NEW",
      items: {
        create: [
          { menuItem: "Paneer Butter Masala", quantity: 1, price: 250 },
          { menuItem: "Butter Naan", quantity: 2, price: 100 },
        ],
      },
    },
    include: { items: true },
  });

  const order2 = await prisma.order.create({
    data: {
      customerName: "Sneha Kapoor",
      totalAmount: 380,
      status: "IN_QUEUE",
      items: {
        create: [
          { menuItem: "Chicken Biryani", quantity: 1, price: 280 },
          { menuItem: "Coke", quantity: 2, price: 100 },
        ],
      },
    },
    include: { items: true },
  });

  // ===== KOTs =====
  await prisma.kOT.create({
    data: {
      orderId: order1.id,
      kotStatus: "PENDING",
      kotItems: {
        create: order1.items.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
        })),
      },
    },
  });

  await prisma.kOT.create({
    data: {
      orderId: order2.id,
      kotStatus: "IN_PROGRESS",
      kotItems: {
        create: order2.items.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
        })),
      },
    },
  });

  // ===== Payments =====
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: 380,
      paymentMode: "UPI",
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
