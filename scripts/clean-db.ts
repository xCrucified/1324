// scripts/clean-db.ts
import { prisma } from "../lib/prisma";

async function cleanUsers() {
  console.log("🧹 Починаємо очищення користувачів...");

  // 1. Видаляємо пов'язані акаунти Google та сесії
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});

  // 2. Якщо є кошики чи замовлення, прив'язані до юзерів (uncomment якщо треба):
  // await prisma.cart.deleteMany({});

  // 3. Видаляємо самих користувачів
  const deleted = await prisma.user.deleteMany({});

  console.log(`✅ Успішно видалено користувачів: ${deleted.count}`);
}

cleanUsers()
  .catch((e) => console.error("❌ Помилка видалення:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });