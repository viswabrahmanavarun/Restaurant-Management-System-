// fixOrders.mts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking orders with missing or empty orderNumber...");

  // Find orders with empty string as orderNumber
  const orders = await prisma.order.findMany({
    where: {
      orderNumber: "", // Prisma v6 non-nullable field cannot be null
    },
  });

  if (orders.length === 0) {
    console.log("No orders need fixing.");
    return;
  }

  for (const order of orders) {
    const newOrderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber: newOrderNumber },
    });
    console.log(`Updated order ${order.id} with orderNumber ${newOrderNumber}`);
  }

  console.log("All orders fixed!");
}

main()
  .catch((err) => {
    console.error("Error fixing orders:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
