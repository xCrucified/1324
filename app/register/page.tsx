/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Стан для згоди та cookie-банера
  const [isAgreed, setIsAgreed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Перевіряємо localStorage при завантаженні сторінки
  useEffect(() => {
    const accepted = localStorage.getItem("pentu_terms_accepted");
    const dismissed = localStorage.getItem("pentu_terms_dismissed");

    if (accepted === "true") {
      setIsAgreed(true);
    } else if (dismissed !== "true") {
      setShowBanner(true);
    }
  }, []);

  const handleCheckboxChange = (checked: boolean) => {
    setIsAgreed(checked);
    if (checked) {
      localStorage.setItem("pentu_terms_accepted", "true");
      setError("");
    } else {
      localStorage.removeItem("pentu_terms_accepted");
    }
  };

  const handleAcceptBanner = () => {
    localStorage.setItem("pentu_terms_accepted", "true");
    setIsAgreed(true);
    setShowBanner(false);
    setError("");
  };

  const handleDismissBanner = () => {
    localStorage.setItem("pentu_terms_dismissed", "true");
    setShowBanner(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAgreed) {
      setError("Будь ласка, прийміть умови користування та політику повернення");
      return;
    }

    setLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Будь ласка, вкажіть ваше ім'я та прізвище.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Будь ласка, введіть дійсний формат електронної пошти.");
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Пароль має містити щонайменше 8 символів, включаючи літери та цифри.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          termsAccepted: isAgreed,
          isRegister: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Помилка під час реєстрації");
        setLoading(false);
        return;
      }

      setStep("code");
    } catch (err) {
      setError("Сталася помилка мережі. Перевірте з'єднання.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        code,
      });

      if (signInRes?.error) {
        setError(signInRes.error || "Невірний код підтвердження");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Помилка верифікації коду");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!isAgreed) {
      setError("Будь ласка, прийміть умови користування та політику повернення");
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md z-10">
        <div className="text-center">
          <Link href="/" className="inline-block mb-3">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Pentu<span className="text-orange-500">24</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {step === "credentials" ? "Створити акаунт" : "Підтвердіть пошту"}
          </h2>
          <p className="mt-1.5 text-xs text-gray-500">
            {step === "credentials"
              ? "Приєднуйтесь до маркету Pentu24"
              : `Код відправлено на ${email}`}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 text-center border border-red-100">
            {error}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ім`я
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Тарас"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Прізвище
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Шевченко"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Електронна пошта
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="taras@example.com"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Мінімум 8 символів"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-orange-500 transition"
                >
                  {showPassword ? "Сховати" : "Показати"}
                </button>
              </div>
            </div>

            {/* Чекбокс з роутами /info/... */}
            <div className="flex items-start gap-2 pt-2 pb-2">
              <input
                type="checkbox"
                id="terms"
                checked={isAgreed}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-tight">
                Я погоджуюсь з{" "}
                <Link href="/info/terms" target="_blank" className="text-orange-500 hover:underline">
                  Умовами використання
                </Link>{" "}
                та{" "}
                <Link href="/info/returns-policy" target="_blank" className="text-orange-500 hover:underline">
                  Політикою повернення
                </Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Завантаження..." : "Зареєструватися"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="shrink-0 px-4 text-xs text-gray-400">Або</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            
            <p className="text-center text-xs text-gray-600 mt-4">
              Вже маєте акаунт?{" "}
              <Link href="/login" className="text-orange-500 font-semibold hover:underline">
                Увійти
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Код підтвердження
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-center text-lg tracking-widest text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none disabled:opacity-50 transition"
            >
              {loading ? "Перевірка..." : "Підтвердити"}
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-xs text-gray-500 hover:text-gray-900 transition mt-2"
            >
              Повернутися назад
            </button>
          </form>
        )}
      </div>

      {/* Cookie Banner з роутами /info/... */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-300">
            Ми використовуємо файли cookie. Продовжуючи, ви погоджуєтесь з нашими{" "}
            <Link href="/info/terms" className="text-orange-400 hover:underline">
              Умовами використання
            </Link>{" "}
            та{" "}
            <Link href="/info/returns-policy" className="text-orange-400 hover:underline">
              Політикою повернення
            </Link>.
          </p>
          <div className="flex gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleDismissBanner}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition"
            >
              Відхилити
            </button>
            <button
              onClick={handleAcceptBanner}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium bg-orange-500 rounded-lg hover:bg-orange-600 transition"
            >
              Прийняти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}