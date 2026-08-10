import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, termsAccepted } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Fill all the gaps" },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "Необхідна згода з політикою користування" },
        { status: 400 }
      );
    }

    // Приводимо email до нижнього регістру та прибираємо зайві пробіли
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Користувач із таким email вже існує! Якщо ви використовували Google, спробуйте увійти через нього." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        termsAccepted: true,
      },
    });

    return NextResponse.json(
      { message: "Register succeed", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Server error while register" },
      { status: 500 }
    );
  }
}