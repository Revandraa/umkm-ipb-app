import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner_id = searchParams.get("owner_id");
    
    if (!owner_id) {
      return NextResponse.json(
        { detail: "owner_id parameter is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (!body.name || !body.location || !body.phone) {
      return NextResponse.json(
        { detail: "Nama, lokasi, dan nomor telepon UMKM harus diisi" },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl && process.env.NEXT_PUBLIC_API_URL) {
      backendUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
    }
    if (backendUrl) {
      backendUrl = backendUrl.replace(/\/+$/, "");
    }
    if (!backendUrl) {
      backendUrl = "http://localhost:8000";
    }
    const response = await fetch(`${backendUrl}/api/v1/umkm/register?owner_id=${owner_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || "Registration failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}
