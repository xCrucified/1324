import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, isRegister, firstName, lastName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email та пароль є обов'язковими" },
        { status: 400 }
      );
    }

    // Ищем пользователя в базе
    const user = await prisma.user.findUnique({ where: { email } });

    // Генерируем код и время жизни (10 минут) заранее для обоих сценариев
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (isRegister) {
      // Формируем полное имя из фронтенда
      const name = `${firstName || ""} ${lastName || ""}`.trim();
      const hashedPassword = await bcrypt.hash(password, 10);

      if (user) {
        // Если пользователь существует и почта УЖЕ подтверждена
        if (user.emailVerified) {
          return NextResponse.json(
            { error: "Користувач із такою поштою вже існує" },
            { status: 400 }
          );
        }

        // Если пользователь существует, но почта НЕ подтверждена:
        // Обновляем его данные новым кодом, паролем и именем
        await prisma.user.update({
          where: { email },
          data: {
            name: name || user.name, // обновляем имя, если оно передано
            password: hashedPassword, // обновляем пароль (если ввели другой)
            verificationCode: code,
            codeExpires,
          },
        });
      } else {
        // Если пользователя вообще нет в базе — создаем с нуля
        await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            verificationCode: code,
            codeExpires,
          },
        });
      }

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "Код відправлено на пошту" });
      
    } else {
      // ==== ЛОГИКА АВТОРИЗАЦИИ (ЛОГИН) ====
      
      if (!user) {
        return NextResponse.json(
          { error: "Користувача з таким email не знайдено" },
          { status: 400 }
        );
      }

      // Если пользователь регался через Google и у него нет пароля
      if (!user.password) {
        return NextResponse.json(
          { error: "Цей акаунт зареєстровано через Google. Будь ласка, увійдіть через Google." },
          { status: 400 }
        );
      }

      // Проверка совпадения пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Невірний пароль" },
          { status: 400 }
        );
      }

      // Если пароль верный, обновляем код для входа
      await prisma.user.update({
        where: { email },
        data: { verificationCode: code, codeExpires },
      });

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "Код відправлено на пошту" });
    }
  } catch (err) {
    console.error("Ошибка API /auth/send-code:", err);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}