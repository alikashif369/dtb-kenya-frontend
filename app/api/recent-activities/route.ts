import { NextResponse } from "next/server";

export async function GET() {
  // Mocked recent activities
  const activities = [
    { id: 1, title: "Tree Planting Drive", subtitle: "Planted 500 trees", createdAt: new Date().toISOString() },
    { id: 2, title: "Solar Panel Installation", subtitle: "Installed 50 panels", createdAt: new Date().toISOString() },
    { id: 3, title: "Recycling Campaign", subtitle: "Collected 200 kg waste", createdAt: new Date().toISOString() },
  ];

  return NextResponse.json(activities);
}
