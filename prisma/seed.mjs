import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin";
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? "12");
  const saltRounds = Number.isFinite(rounds) ? rounds : 12;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN" },
    create: { username, passwordHash, role: "ADMIN" },
  });

  console.log(`Seeded admin user: ${username}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
