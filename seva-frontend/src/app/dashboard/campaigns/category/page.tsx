"use client";

import { useState } from "react";
import ProductsTab from "../components/ProductsTab";
import CategoriesTab from "../components/CategoriesTab";

export default function ProductsCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
        <p className="text-sm text-white/40 mt-1">Manage products and categories for campaigns</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 w-fit card-surface p-1">
        {(["products", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? "bg-gold text-navy shadow-lg shadow-gold/20"
                : "text-white/50 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "products" ? <ProductsTab /> : <CategoriesTab />}
    </div>
  );
}
