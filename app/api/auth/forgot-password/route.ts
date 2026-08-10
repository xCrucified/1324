import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, code, newPassword } = body;

    if (!email) {
      return NextResponse.json({ error: "Вкажіть електронну пошту" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // =====================================
    // 1. ВІДПРАВКА КОДУ
    // =====================================
    if (action === "send-code") {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (!user) {
        return NextResponse.json({ error: "Користувача не знайдено" }, { status: 404 });
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

      // Зберігаємо код у БД
      await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          verificationCode: generatedCode,
          codeExpires: expiresAt, 
        },
      });

      // Реальна відправка листа на пошту
      try {
        await sendVerificationEmail(cleanEmail, generatedCode);
      } catch (mailError) {
        console.error("Помилка відправки листа для скидання пароля:", mailError);
        return NextResponse.json(
          { error: "Не вдалося відправити лист. Перевірте налаштування пошти." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: "Код відправлено" });
    }

    // =====================================
    // 2. ПЕРЕВІРКА КОДУ
    // =====================================
    if (action === "verify-code") {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (!user || user.verificationCode !== code) {
        return NextResponse.json({ error: "Невірний код" }, { status: 400 });
      }

      if (user.codeExpires && new Date() > user.codeExpires) {
        return NextResponse.json({ error: "Час дії коду вичерпано" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Код підтверджено" });
    }

    // =====================================
    // 3. ЗМІНА ПАРОЛЯ
    // =====================================
    if (action === "reset") {
      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (!user || user.verificationCode !== code) {
        return NextResponse.json({ error: "Невірний код або сесія застаріла" }, { status: 400 });
      }

      if (user.codeExpires && new Date() > user.codeExpires) {
        return NextResponse.json({ error: "Час дії коду вичерпано" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          password: hashedPassword,
          verificationCode: null,
          codeExpires: null,
        },
      });

      return NextResponse.json({ success: true, message: "Пароль змінено" });
    }

    return NextResponse.json({ error: "Невідома дія" }, { status: 400 });

  } catch (error) {
    console.error("Помилка forgot-password:", error);
    return NextResponse.json({ error: "Внутрішня помилка сервера" }, { status: 500 });
  }
}