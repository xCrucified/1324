"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isRegister: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при отправке кода");
        setLoading(false);
        return;
      }

      setStep("code");
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Вызываем стандартный credentials sign-in, куда передаем код вместо пароля (или проверяем в NextAuth authorize)
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password, // либо передаем код, если настроили авторизацию по коду в NextAuth options
        code,
      });

      if (res?.error) {
        setError(res.error || "Неверный код подтверждения");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Ошибка при авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {step === "credentials" ? "Log Into Account" : "Введите код подтверждения"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "credentials" ? "Welcome back to Pentu" : `Код отправлен на ${email}`}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Отправка кода..." : "Получить код на почту"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">6-значный код</label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Проверка..." : "Подтвердить и войти"}
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-xs text-gray-500 hover:underline mt-2"
            >
              Назад к вводу данных
            </button>
          </form>
        )}

        {step === "credentials" && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400">или</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div>
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition cursor-pointer"
              >
                Log In via Google
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Нет аккаунта?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:underline">
                Registration
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}