import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const clerkId = process.argv[2];
if (!clerkId) {
  console.error("Usage: npx ts-node scripts/set-seller-role.ts <clerkId>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { clerkId },
    data: { role: "SELLER" },
  });
  console.log(`Updated ${user.email} (${user.clerkId}) → SELLER`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
