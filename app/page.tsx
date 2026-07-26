import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import TopBar from "@/components/shared/top-bar";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const selectedCategory = params.category || "Home";

  // Формируем фильтр для базы данных
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

  // Получаем отфильтрованные продукты из базы данных
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <TopBar />
      <Header />
      <Main products={products} selectedCategory={selectedCategory} />
      <Footer />
    </>
  );
}