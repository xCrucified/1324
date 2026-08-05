import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Спеціальний клас для передачі кастомних помилок у NextAuth v5 без збою Configuration
class CustomAuthError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.message = message;
    (this as any).code = message;
  }
}

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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("\n================== 🔍 DEBUG AUTH START ==================");
        console.log("1️⃣ Вхідні дані з форми:", {
          emailRaw: credentials?.email,
          hasPasswordInput: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Помилка: Не передано email або пароль з форми");
          console.log("================== 🔍 DEBUG AUTH END ==================\n");
          throw new CustomAuthError("Введіть email та пароль");
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        console.log("2️⃣ Нормалізований email:", email);

        // Пошук користувача в базі
        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log("3️⃣ Результат запиту до БД:", {
          userFound: !!user,
          userId: user?.id,
          userEmailInDb: user?.email,
          hasPasswordInDb: !!user?.password,
          passwordHashPreview: user?.password ? `${user.password.substring(0, 15)}...` : null,
        });

        // 1. Користувача взагалі немає в базі
        if (!user) {
          console.log("❌ Помилка: Користувача з таким email НЕ ЗНАЙДЕНО в БД");
          console.log("================== 🔍 DEBUG AUTH END ==================\n");
          throw new CustomAuthError("Акаунт з таким email не знайдено. Зареєструйтесь!");
        }

        // 2. Користувач є, але немає пароля (реєструвався через Google)
        if (!user.password) {
          console.log("❌ Помилка: У користувача НЕМАЄ пароля в БД (авторизація через Google)");
          console.log("================== 🔍 DEBUG AUTH END ==================\n");
          throw new CustomAuthError("Цей акаунт зареєстровано через Google. Увійдіть за допомогою Google!");
        }

        // 3. Порівняння введеного пароля із захешованим у базі
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log("4️⃣ Перевірка bcrypt.compare():", {
          isPasswordValid,
        });

        if (!isPasswordValid) {
          console.log("❌ Помилка: Пароль з форми НЕ ЗБІГАЄТЬСЯ з хешем у БД");
          console.log("================== 🔍 DEBUG AUTH END ==================\n");
          throw new CustomAuthError("Невірний пароль");
        }

        console.log("✅ Авторизація успішна для ID:", user.id);
        console.log("================== 🔍 DEBUG AUTH END ==================\n");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.role) {
          (session.user as any).role = token.role as string; 
        }
      }
      return session;
    },
  },
});

export const { GET, POST } = handlers;