"use client";

import Banner from "@/components/Banner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Form from "@/components/Form";

export default function Home() {
  return (
    <>
      <Banner />
      <Header />
      <main className="container section-padding" style={{ flex: 1 }}>
        <Form />
      </main>
      <Footer />
    </>
  );
}
