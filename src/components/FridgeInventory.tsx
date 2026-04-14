"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FridgeItem, Category, CATEGORIES } from "@/lib/types";
import AddItemForm from "./AddItemForm";
import CategoryGroup from "./CategoryGroup";

export default function FridgeInventory() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from("fridge_items")
      .select("*")
      .order("added_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error.message, error.details, error.hint);
    } else {
      setItems(data as FridgeItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const grouped = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category === cat);
      return acc;
    },
    {} as Record<Category, FridgeItem[]>
  );

  const totalItems = items.length;
  const expiring = items.filter((item) => {
    const days = Math.floor(
      (Date.now() - new Date(item.added_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days >= 5;
  }).length;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left: Inventory list (7/10) */}
      <div className="flex flex-col gap-6 lg:w-7/10">
        {/* Stats bar */}
        <div className="flex items-center justify-between rounded-xl bg-sage-light/60 px-5 py-3">
          <span className="text-sm font-medium text-sage">
            {totalItems} item{totalItems !== 1 ? "s" : ""} tracked
          </span>
          {expiring > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {expiring} need{expiring !== 1 ? "" : "s"} attention
            </span>
          )}
        </div>

        {/* Item list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-sage-light border-t-sage" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sage/15 py-20 text-center">
            <div className="mb-4 text-5xl">🥗</div>
            <p className="text-lg font-medium text-zinc-400">
              Your fridge is empty
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Add your first item to start tracking freshness
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryGroup
                key={cat}
                category={cat}
                items={grouped[cat]}
                onChanged={fetchItems}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Add item panel (3/10) */}
      <div className="lg:w-3/10">
        <div className="sticky top-6 rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/80 border border-orange-200/60 p-6 shadow-sm">
          <div className="mb-1 text-2xl">🍳</div>
          <h2 className="mb-1 text-lg font-bold text-orange-800">
            Add Item
          </h2>
          <p className="mb-5 text-xs text-orange-600/70">
            What did you bring home?
          </p>
          <AddItemForm onAdded={fetchItems} />
        </div>
      </div>
    </div>
  );
}
