import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
        code: { label: "Code", type: "text" } // Додано поле для коду підтвердження
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Введіть email");
        }

        // Нормалізація email для точного пошуку
        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new Error("Користувача не знайдено");
        }

        // === СЦЕНАРІЙ 1: Підтвердження входу/реєстрації за кодом ===
        if (credentials.code) {
          const inputCode = credentials.code as string;
          
          if (user.verificationCode !== inputCode) {
            throw new Error("Невірний код підтвердження");
          }
          
          if (user.codeExpires && new Date() > new Date(user.codeExpires)) {
            throw new Error("Термін дії коду вичерпано");
          }

          // Очищаємо код після успішного підтвердження
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

        // === СЦЕНАРІЙ 2: Звичайний вхід за паролем ===
        if (credentials.password) {
          if (!user.password) {
            throw new Error("Цей акаунт зареєстровано через Google. Увійдіть через Google.");
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            throw new Error("Невірний пароль");
          }

          return user;
        }

        throw new Error("Введіть пароль або код підтвердження");
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});