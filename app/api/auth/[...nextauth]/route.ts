import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) {
          throw new Error("Введите email и код подтверждения");
        }

        // Поиск пользователя в базе
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.verificationCode || !user.codeExpires) {
          throw new Error("Код не найден или не запрашивался");
        }

        // Проверка срока действия кода (10 минут)
        if (new Date() > user.codeExpires) {
          throw new Error("Срок действия кода истек");
        }

        // Проверка совпадения кода
        if (user.verificationCode !== (credentials.code as string)) {
          throw new Error("Неверный код подтверждения");
        }

        // Успех: очищаем использованный код и помечаем email как подтвержденный
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationCode: null,
            codeExpires: null,
            emailVerified: new Date(),
          },
        });

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt", 
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
});

export const { GET, POST } = handlers;