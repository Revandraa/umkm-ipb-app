import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi basic
    if (!body.email || !body.password) {
      return NextResponse.json(
        { detail: "Email dan password harus diisi" },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || "Email atau password salah" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}

