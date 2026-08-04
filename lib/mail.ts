import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Pentu24 <noreply@pentu24.com>",
      to: email,
      subject: "Код підтвердження — Pentu24",
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Логотип компанії -->
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 800; color: #f97316;">Pentu</span><span style="font-size: 28px; font-weight: 800; color: #1f2937;">24</span>
            <div style="font-size: 10px; font-weight: 600; color: #6b7280; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">Маркетплейс</div>
          </div>
          
          <h2 style="color: #111827; margin-top: 0; font-size: 22px; text-align: center; font-weight: 600;">Підтвердження входу</h2>
          <p style="color: #4b5563; font-size: 15px; text-align: center; margin-bottom: 24px;">Ваш одноразовий код авторизації:</p>
          
          <!-- Блок з кодом (стилізований під помаранчевий акцент сайту) -->
          <div style="background-color: #fff7ed; border: 1px solid #fdba74; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ea580c; display: inline-block; margin-left: 8px;">${code}</span>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-bottom: 0; line-height: 1.5;">
            Код дійсний протягом 10 хвилин.<br />
            Якщо ви не запитували цей код, просто проігноруйте цей лист.
          </p>
          
        </div>
      `,
    });

    if (error) {
      console.error("❌ Помилка Resend API:", error);
      throw new Error(error.message || "Помилка відправки листа через Resend");
    }

    console.log("✅ Лист успішно відправлено (ID):", data?.id);
    return data;
  } catch (err) {
    console.error("❌ Помилка у функції sendVerificationEmail:", err);
    throw err;
  }
}