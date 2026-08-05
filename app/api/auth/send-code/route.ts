// app/api/auth/send-code/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 🔍 ДЕБАГ: дивимося у термінал, що саме прислав фронтенд
    console.log("=== API SEND-CODE BODY ===", body);

    const { password, isRegister, firstName, lastName } = body;
    let email = body.email;

    if (!email || !password) {
      console.log("❌ Помилка: Немає email або password");
      return NextResponse.json(
        { error: "Email та пароль є обов'язковими" },
        { status: 400 }
      );
    }

    email = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (isRegister) {
      // ==== РЕЄСТРАЦІЯ ====
      const name = `${firstName || ""} ${lastName || ""}`.trim();
      const hashedPassword = await bcrypt.hash(password, 10);

      if (user) {
        if (user.emailVerified) {
          console.log("❌ Помилка: Користувач вже підтверджений");
          return NextResponse.json(
            { error: "Користувач із такою поштою вже існує" },
            { status: 400 }
          );
        }

        await prisma.user.update({
          where: { email },
          data: {
            name: name || user.name,
            password: hashedPassword,
            verificationCode: code,
            codeExpires,
          },
        });
      } else {
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
      // ==== ВХІД ====
      if (!user) {
        console.log("❌ Помилка: Спрацювала логіка входу, але user не знайдено! (Перевірте чи передається isRegister: true з фронтенду)");
        return NextResponse.json(
          { error: "Користувача з таким email не знайдено" },
          { status: 400 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "Цей акаунт зареєстровано через Google." },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("❌ Помилка: Невірний пароль при вході");
        return NextResponse.json(
          { error: "Невірний пароль" },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { email },
        data: { verificationCode: code, codeExpires },
      });

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true, message: "Код відправлено на пошту" });
    }
  } catch (err) {
    console.error("Помилка API /auth/send-code:", err);
    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 }
    );
  }
}