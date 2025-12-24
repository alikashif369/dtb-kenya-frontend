import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function GET() {
  try {
    console.log("[API_ROUTE] Fetching vector layers from backend:", `${API_BASE}/vectors`);
    
    const response = await fetch(`${API_BASE}/vectors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log("[API_ROUTE] Backend response status:", response.status);

    if (!response.ok) {
      console.error("[API_ROUTE] Backend responded with error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Backend service unavailable", success: false, data: [] },
        { status: 503 }
      );
    }

    const data = await response.json();
    console.log("[API_ROUTE] Received data from backend, count:", Array.isArray(data) ? data.length : 'unknown');
    
    // The backend returns an array directly
    if (Array.isArray(data)) {
      return NextResponse.json({
        success: true,
        data,
        count: data.length
      });
    }
    
    // If already wrapped, pass through
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API_ROUTE] Error fetching vector layers:", error);
    // Return empty data instead of error to prevent frontend crashes
    return NextResponse.json({
      success: false,
      message: "Backend service not available",
      data: [],
      count: 0
    });
  }
}
