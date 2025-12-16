// fixStaffId.js
// -----------------------------------------
// Run with: node fixStaffId.js
// -----------------------------------------

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runFix() {
  console.log("🔍 Checking users with missing staffId...\n");

  // 1. Fetch all users
  const users = await prisma.user.findMany();

  const prefixMap = {
    admin: "A",
    manager: "M",
    chef: "C",
    waiter: "W",
  };

  let updates = [];

  // 2. Process users with null or missing staffId
  for (const user of users) {
    if (!user.staffId || user.staffId === null || user.staffId === "") {
      const prefix = prefixMap[user.role?.toLowerCase()] || "S";

      // Count current users of same role WITH staffId
      const sameRoleUsers = users.filter(
        (u) => u.role?.toLowerCase() === user.role?.toLowerCase() && u.staffId
      );

      const nextNumber = String(sameRoleUsers.length + 1).padStart(2, "0");
      const generatedId = `${prefix}-${nextNumber}`;

      updates.push({
        id: user.id,
        staffId: generatedId,
      });
    }
  }

  if (updates.length === 0) {
    console.log("✅ All users already have valid staffId. No changes needed.");
    process.exit(0);
  }

  console.log("🛠️ Fixing staffId for", updates.length, "users...\n");

  // 3. Update each user
  for (const update of updates) {
    await prisma.user.update({
      where: { id: update.id },
      data: { staffId: update.staffId },
    });

    console.log(`✔ Updated user ${update.id} → staffId = ${update.staffId}`);
  }

  console.log("\n🎉 FIX COMPLETED SUCCESSFULLY!");
  console.log("Now run:  npx prisma db push\n");

  process.exit(0);
}

runFix().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
