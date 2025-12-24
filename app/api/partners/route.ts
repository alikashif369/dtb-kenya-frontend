import { NextResponse } from "next/server";

export async function GET() {
  // Mocked partner data
  const partners = [
    { id: 1, name: "GreenCorp", logoUrl: "/logos/greencorp.png" },
    { id: 2, name: "EcoPartners", logoUrl: "/logos/ecopartners.png" },
    { id: 3, name: "PlantHeroes", logoUrl: "/logos/plantheroes.png" },
  ];

  return NextResponse.json(partners);
}
