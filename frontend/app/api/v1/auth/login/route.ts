import { NextResponse } from "next/server";
import { getUsers } from "@/lib/local-db";

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
    
    const users = getUsers();
    const user = users.find((u: any) => u.email === body.email && u.password === body.password);

    if (!user) {
      return NextResponse.json(
        { detail: "Email atau password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token: "mock-jwt-token-" + user.id,
      token_type: "bearer",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}
