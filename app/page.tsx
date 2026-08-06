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
      categoryId: selectedCategory,
    };
  }

  // 3. Завантажуємо товари з бази даних
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((product) => ({
    ...product,
    category: null,
  }));

  return (
    <>
      <TopBar />
      <Header />
      <Main initialProducts={formattedProducts as any} selectedCategory={selectedCategory} />
      <Footer />
    </>
  );
}