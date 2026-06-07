"use client";

import Banner from "@/components/Banner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HistoryList from "@/components/HistoryList";

export default function HistoryPage() {
  return (
    <>
      <Banner />
      <Header />
      <main className="container section-padding" style={{ flex: 1 }}>
        <HistoryList />
      </main>
      <Footer />
    </>
  );
}
