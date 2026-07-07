import bcrypt from "bcryptjs";
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import config from "../src/config";

async function main() {
  const adminEmail = config.admin_email;
  const adminPassword = config.admin_password;

  const isExistingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!isExistingAdmin) {
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      Number(config.bcrypt_salt_rounds) || 10,
    );

    await prisma.user.create({
      data: {
        name: "GearUp Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const categories = [
    { name: "Cycling", slug: "cycling" },
    { name: "Camping", slug: "camping" },
    { name: "Fitness", slug: "fitness" },
    { name: "Water Sports", slug: "water-sports" },
    { name: "Winter Sports", slug: "winter-sports" },
    { name: "Summer Sports", slug: "summer-sports" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("Categories seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
