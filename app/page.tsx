import { prisma } from "@/lib/prisma";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import TopBar from "@/components/shared/top-bar";
import { getCategoryAndSubIds, getCategoryDetails } from "@/store/categories";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  // 1. Отримуємо параметри пошуку/категорії з URL
  const resolvedParams = await searchParams;
  const selectedCategory = resolvedParams?.category || "Home";

  // 2. Формуємо умову для вибірки з БД з урахуванням спеціальних вкладок
  let whereClause: any = {};
  const orderBy: any = { createdAt: "desc" };

  if (selectedCategory === "Flash Sale") {
    // Логіка для акційних товарів
  } else if (selectedCategory === "New Arrivals") {
    // Останні надходження
  } else if (selectedCategory === "Sellers" || selectedCategory === "Home") {
    // Показуємо всі товари
    whereClause = {};
  } else {
    // Звичайна категорія: отримуємо саму категорію та всі її підкатегорії
    const categoryIds = getCategoryAndSubIds(selectedCategory);
    if (categoryIds.length > 0) {
      whereClause = {
        categoryId: { in: categoryIds },
      };
    }
  }

  // 3. Завантажуємо товари з бази даних
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy,
  });

  const formattedProducts = products.map((product) => ({
    ...product,
    category: null,
  }));

  // 4. Функція для перекладу системного ID у нормальну українську назву для заголовка
  const getCategoryTitle = (cat: string) => {
    const titles: Record<string, string> = {
      Home: "Усі товари",
      "Flash Sale": "Гарячі знижки",
      "New Arrivals": "Новинки",
      Sellers: "Популярні товари",
    };

    if (titles[cat]) {
      return titles[cat];
    }

    const details = getCategoryDetails(cat);
    return details ? details.name : cat;
  };

  const categoryTitle = getCategoryTitle(selectedCategory);

  return (
    <>
      <TopBar />
      <Header />
      <Main 
        initialProducts={formattedProducts as any} 
        selectedCategory={selectedCategory} 
        categoryTitle={categoryTitle} 
      />
      <Footer />
    </>
  );
}