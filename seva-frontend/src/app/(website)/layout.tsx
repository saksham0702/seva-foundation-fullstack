import React from "react";
import Header from "@/components/website/layout/Header";
import Footer from "@/components/website/layout/Footer";
import PageTransition from "@/components/website/layout/PageTransition";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
    </div>
  );
}