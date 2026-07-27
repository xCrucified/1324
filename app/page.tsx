import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import TopBar from "@/components/shared/top-bar";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  // 1. Отримуємо параметри пошуку/категорії з URL
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams?.category || "Home";

  // 2. Формуємо умову для вибірки з БД
  let whereClause = {};
  if (
    selectedCategory !== "Home" &&
    selectedCategory !== "Flash Sale" &&
    selectedCategory !== "New Arrivals" &&
    selectedCategory !== "Sellers"
  ) {
    whereClause = {
      category: {
        name: selectedCategory,
      },
    };
  }

  // 3. Завантажуємо товари з бази даних
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <TopBar />
      <Header />
      <Main initialProducts={products} selectedCategory={selectedCategory} />
      <Footer />
    </>
  );
}