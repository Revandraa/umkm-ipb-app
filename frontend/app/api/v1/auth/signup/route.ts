import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi basic
    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json(
        { detail: "Semua field harus diisi" },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend
    let backendUrl = process.env.BACKEND_URL;
    if (!backendUrl && process.env.NEXT_PUBLIC_API_URL) {
      backendUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
    }
    if (!backendUrl) {
      backendUrl = "http://localhost:8000";
    }
    const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        full_name: body.full_name,
        role: body.role || "customer",
        phone: body.phone || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || "Registrasi gagal" },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Return format yang kompatibel dengan respons backend langsung (data.id)
    // dan juga mendukung format mock sebelumnya (data.user.id) untuk keandalan maksimal.
    return NextResponse.json({
      ...data,
      user: data
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}

