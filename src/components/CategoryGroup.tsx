"use client";

import {
  Category,
  FridgeItem,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
} from "@/lib/types";
import FridgeItemRow from "./FridgeItem";

export default function CategoryGroup({
  category,
  items,
}: {
  category: Category;
  items: FridgeItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-base">
          {CATEGORY_ICONS[category]}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-bark">
            {CATEGORY_LABELS[category]}
          </h3>
          <p className="text-xs text-zinc-400">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <FridgeItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
