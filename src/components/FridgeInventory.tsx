"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FridgeItem, Category, CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types";
import AddItemForm from "./AddItemForm";
import CategoryGroup from "./CategoryGroup";

export default function FridgeInventory() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  useEffect(() => {
    const supabase = getSupabase();

    supabase
      .from("fridge_items")
      .select("*")
      .order("added_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching items:", error.message);
        } else {
          setItems(data as FridgeItem[]);
        }
        setLoading(false);
      });

    const channel = supabase
      .channel("fridge_items_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fridge_items" },
        (payload) => {
          setItems((prev) => [payload.new as FridgeItem, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "fridge_items" },
        (payload) => {
          setItems((prev) => prev.filter((item) => item.id !== payload.old.id));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "fridge_items" },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? (payload.new as FridgeItem) : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category === cat).length;
      return acc;
    },
    {} as Record<Category, number>
  );

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = filteredItems.filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<Category, FridgeItem[]>
  );

  const totalItems = items.length;
  const expiringSoon = items.filter((item) => {
    if (item.expires_at) {
      const d = Math.ceil(
        (new Date(item.expires_at + "T00:00:00").getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      return d <= 2;
    }
    const days = Math.floor(
      (Date.now() - new Date(item.added_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days >= 5;
  }).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-sand p-5">
          <p className="text-3xl font-bold text-gold">{totalItems}</p>
          <p className="mt-1 text-xs text-zinc-500">Total items</p>
        </div>
        <div className="rounded-2xl bg-sand p-5">
          <p className="text-3xl font-bold text-gold">
            {Object.values(categoryCounts).filter((c) => c > 0).length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Categories</p>
        </div>
        <div className="rounded-2xl bg-sand p-5">
          <p className={`text-3xl font-bold ${expiringSoon > 0 ? "text-red-500" : "text-gold"}`}>
            {expiringSoon}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Expiring soon</p>
        </div>
        <div className="rounded-2xl bg-sand p-5">
          <p className="text-3xl font-bold text-gold">
            {items.filter((i) => i.location === "freezer").length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">In freezer</p>
        </div>
      </div>

      {/* Category pills */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-bark">Browse by category</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              activeCategory === "all"
                ? "bg-gold text-white shadow-sm"
                : "bg-sand text-zinc-600 hover:bg-sand-dark"
            }`}
          >
            All
            <span className="text-xs opacity-70">{totalItems}</span>
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-gold text-white shadow-sm"
                  : "bg-sand text-zinc-600 hover:bg-sand-dark"
              }`}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
              <span className="text-xs opacity-70">{categoryCounts[cat]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content: items + add form */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Items (7/10) */}
        <div className="flex flex-col gap-6 lg:w-7/10">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-gold-light border-t-gold" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 py-20 text-center">
              <div className="mb-4 text-5xl">
                {activeCategory === "all" ? "🛒" : CATEGORY_ICONS[activeCategory]}
              </div>
              <p className="text-base font-medium text-zinc-400">
                {activeCategory === "all"
                  ? "Your fridge is empty"
                  : `No ${CATEGORY_LABELS[activeCategory].toLowerCase()} items`}
              </p>
              <p className="mt-1 text-sm text-zinc-300">
                Add items to start tracking freshness
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {CATEGORIES.map((cat) => (
                <CategoryGroup key={cat} category={cat} items={grouped[cat]} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Add form (3/10) */}
        <div className="lg:w-3/10">
          <div className="sticky top-6 rounded-3xl bg-sand p-6">
            <h2 className="mb-1 text-base font-bold text-bark">
              Add new item
            </h2>
            <p className="mb-5 text-xs text-zinc-400">
              What did you bring home?
            </p>
            <AddItemForm />
          </div>
        </div>
      </div>
    </div>
  );
}
