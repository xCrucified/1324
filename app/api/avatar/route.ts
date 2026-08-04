import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  // 1. Проверяем, что юзер авторизован (чтобы чужие не качали картинки)
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Достаем URL картинки из параметров (например: /api/avatar?url=https://...)
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    // 3. Делаем запрос к Vercel Blob, передавая наш секретный токен
    const response = await fetch(imageUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch image from Blob");
    }

    // 4. Отдаем картинку браузеру
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=3600", // Кешируем на час, чтобы не дергать сервер постоянно
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Error loading image", { status: 500 });
  }
}