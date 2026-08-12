import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Спеціальний клас помилки для NextAuth v5, щоб текст доходив до клієнта
class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.message = message;
    // Передаємо текст у код, щоб він зчитався на клієнті через res.code
    (this as any).code = message;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Залишаємо адаптер тільки якщо він коректно створений у Prisma, 
  // але для чистих Credentials краще робити через JWT. 
  // Якщо виникають помилки конфігурації з адаптером, його можна тимчасово закоментувати.
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // шлях до вашої сторінки логіну
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new CustomAuthError("Введіть email");
        }

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new CustomAuthError("Користувача не знайдено");
        }

        // === СЦЕНАРІЙ 1: Підтвердження за кодом ===
        if (credentials.code) {
          const inputCode = credentials.code as string;
          
          if (user.verificationCode !== inputCode) {
            throw new CustomAuthError("Невірний код підтвердження");
          }
          
          if (user.codeExpires && new Date() > new Date(user.codeExpires)) {
            throw new CustomAuthError("Термін дії коду вичерпано");
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: new Date(),
              verificationCode: null,
              codeExpires: null,
            }
          });

          return user;
        }

        // === СЦЕНАРІЙ 2: Вхід за паролем ===
        if (credentials.password) {
          if (!user.password) {
            throw new CustomAuthError("Цей акаунт зареєстровано через Google. Увійдіть через Google.");
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            throw new CustomAuthError("Невірний пароль");
          }

          return user;
        }

        throw new CustomAuthError("Введіть пароль або код підтвердження");
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});