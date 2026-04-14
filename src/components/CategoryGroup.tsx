"use client";

import {
  Category,
  FridgeItem,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/lib/types";
import FridgeItemRow from "./FridgeItem";

const CATEGORY_COLORS: Record<Category, string> = {
  produce: "bg-green-50 text-green-700 border-green-200",
  dairy: "bg-yellow-50 text-yellow-700 border-yellow-200",
  leftovers: "bg-orange-50 text-orange-700 border-orange-200",
  condiments: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

export default function CategoryGroup({
  category,
  items,
  onChanged,
}: {
  category: Category;
  items: FridgeItem[];
  onChanged: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[category]}`}
        >
          <span>{CATEGORY_ICONS[category]}</span>
          {CATEGORY_LABELS[category]}
        </span>
        <span className="text-xs text-zinc-400">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <FridgeItemRow key={item.id} item={item} onRemoved={onChanged} />
        ))}
      </div>
    </section>
  );
}
