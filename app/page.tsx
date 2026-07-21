import Footer from "@/components/footer";
import Header from "@/components/header";
import Main from "@/components/main";
import TopBar from "@/components/shared/top-bar";

import React from "react";

interface Props {
  className?: string;
}

export const Page: React.FC<Props> = ({ }) => {
  return (
    <>
      <TopBar />
      <Header />
      <Main />
      <Footer />
    </>
  );
};

export default Page;
