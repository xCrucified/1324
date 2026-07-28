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
        { error: "Необходимо согласие с политикой пользования" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует! Если вы использовали Google, попробуйте войти через него." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        termsAccepted: true, // Сохраняем подтверждение в базу
      },
    });

    return NextResponse.json(
      { message: "Register succeed", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Server error while register" },
      { status: 500 }
    );
  }
}