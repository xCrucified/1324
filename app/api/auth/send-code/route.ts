import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, isRegister } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Если это регистрация, проверяем, существует ли пользователь
    let user = await prisma.user.findUnique({ where: { email } });

    if (isRegister) {
      if (user) {
        return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 });
      }
      // Хэшируем пароль заранее и сохраняем вместе с кодом
      const hashedPassword = await bcrypt.hash(password, 10);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          verificationCode: code,
          codeExpires,
        },
      });

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "Код отправлен на почту" });
    } else {
      // Логин: проверяем существование пользователя
      if (!user) {
        return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
      }

      // Генерируем код для входа
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.user.update({
        where: { email },
        data: { verificationCode: code, codeExpires },
      });

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "Код отправлен на почту" });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}