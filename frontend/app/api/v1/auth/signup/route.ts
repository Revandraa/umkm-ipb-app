import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/local-db";

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
    
    const users = getUsers();
    if (users.find((u: any) => u.email === body.email)) {
      return NextResponse.json(
        { detail: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      email: body.email,
      password: body.password,
      full_name: body.full_name,
      role: body.role || "customer",
    };

    users.push(newUser);
    saveUsers(users);

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}
