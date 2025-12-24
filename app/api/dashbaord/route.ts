import { NextResponse } from "next/server";

export async function GET() {
  // Mocked dashboard stats
  const stats = {
    id: 1,
    treesPlanted: 1200,
    energyGenerated: 5400,
    wasteRecycled: 300,
    livesImpacted: 150,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(stats);
}
