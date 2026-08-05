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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Состояния для баннера-куки
  const [isAgreed, setIsAgreed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Проверяем localStorage при загрузке страницы
  useEffect(() => {
    const accepted = localStorage.getItem("pentu_terms_accepted");
    const dismissed = localStorage.getItem("pentu_terms_dismissed");

    if (accepted === "true") {
      setIsAgreed(true);
    } else if (dismissed !== "true") {
      // Показываем, только если не приняли и не скрывали вручную
      setShowBanner(true);
    }
  }, []); 

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

    // Если попытались отправить форму без согласия
    if (!isAgreed) {
      setError("Пожалуйста, примите условия политики пользования");
      setShowBanner(true);
      return;
    }

    setLoading(true);

    // 1. Перевірка імені та прізвища
    if (!firstName.trim() || !lastName.trim()) {
      setError("Будь ласка, вкажіть ваше ім'я та прізвище.");
      setLoading(false);
      return;
    }

    // 2. Валідація Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Будь ласка, введіть дійсний формат електронної пошти.");
      setLoading(false);
      return;
    }

    // 3. Валідація складності пароля (мін. 8 символів, літери + цифри)
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
          termsAccepted: isAgreed // Передаем согласие на сервер
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
      setError("Пожалуйста, примите условия политики пользования");
      setShowBanner(true);
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md">
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
            {/* Поля Ім'я та Прізвище */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ім'я
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

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Електронна пошта
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
              />
            </div>

            {/* Пароль */}
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
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-xs text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Створення..." : "Зареєструватися"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                6-значний код
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-base rounded-xl border border-gray-200 px-3.5 py-2.5 text-gray-900 focus:border-orange-500 focus:outline-none transition bg-gray-50/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-orange-600 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? "Перевірка..." : "Підтвердити код"}
            </button>
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 transition mt-2 cursor-pointer"
            >
              Назад до введення даних
            </button>
          </form>
        )}

        {step === "credentials" && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400">або</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Зареєструватися через Google
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Вже є акаунт?{" "}
              <Link href="/login" className="font-medium text-orange-500 hover:underline">
                Увійти
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Всплывающее окно / Cookie banner слева снизу */}
      {showBanner && (
        <div className="fixed bottom-6 left-6 z-50 w-80 rounded-xl bg-white p-5 shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Соглашение пользователя
            </h3>
            <button 
              onClick={handleDismissBanner}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Закрыть"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Мы используем файлы cookie. Для регистрации и использования платформы необходимо ознакомиться и согласиться с нашей{" "}
            <Link href="/info/terms" className="text-blue-600 hover:underline" target="_blank">
              политикой пользования
            </Link>.
          </p>
          
          <button
            onClick={handleAcceptBanner}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Принять и продолжить
          </button>
        </div>
      )}
    </div>
  );
}