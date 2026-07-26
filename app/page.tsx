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

  return (
    <>
      <TopBar />
      <Header />
      <Main selectedCategory={selectedCategory} />{" "}
      <Footer />
    </>
  );
}
