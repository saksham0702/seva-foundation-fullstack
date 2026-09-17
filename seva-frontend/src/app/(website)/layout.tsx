import React from "react";
import Header from "@/components/website/layout/Header";
import Footer from "@/components/website/layout/Footer";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}