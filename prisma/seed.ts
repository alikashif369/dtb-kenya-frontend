import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.dashboardStats.create({
    data: {
      treesPlanted: 623000,
      energyGenerated: 3300000,
      wasteRecycled: 1000,
      livesImpacted: 10000,
    },
  });

  await prisma.recentActivity.createMany({
    data: [
      {
        title: "New plantation site",
        subtitle: "Shukat Darra - 3,500 trees planted",
      },
      {
        title: "Solar installation complete",
        subtitle: "Amboseli Lodge - 250kW capacity",
      },
    ],
  });

  await prisma.partner.createMany({
    data: [
      {
        name: "WWF Pakistan",
        logoUrl: "https://via.placeholder.com/120x80?text=WWF",
      },
      {
        name: "AKRSP",
        logoUrl: "https://via.placeholder.com/120x80?text=AKRSP",
      },
    ],
  });
}

main();
