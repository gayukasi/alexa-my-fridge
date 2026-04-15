"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FridgeItem as FridgeItemType, LOCATION_LABELS } from "@/lib/types";

function daysAgo(dateStr: string): number {
  const added = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24));
}

function ageClass(days: number): string {
  if (days >= 7) return "text-red-600 font-semibold";
  if (days >= 5) return "text-amber-600 font-semibold";
  return "text-zinc-400";
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryClass(days: number): string {
  if (days < 0) return "bg-red-50 text-red-600 border-red-200";
  if (days <= 2) return "bg-amber-50 text-amber-600 border-amber-200";
  return "bg-zinc-50 text-zinc-500 border-zinc-200";
}

function expiryLabel(days: number): string {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Exp. in ${days}d`;
}

const LOCATION_ICONS: Record<string, string> = {
  fridge: "❄️",
  freezer: "🧊",
  pantry: "🏠",
};

export default function FridgeItemRow({
  item,
}: {
  item: FridgeItemType;
}) {
  const [removing, setRemoving] = useState(false);
  const days = daysAgo(item.added_at);

  async function handleRemove() {
    setRemoving(true);
    const { error } = await getSupabase()
      .from("fridge_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("Error removing item:", error);
      setRemoving(false);
    }
    // No need to call onRemoved — realtime handles the state update
  }

  return (
    <div className="group flex items-center justify-between rounded-xl bg-cream/60 px-4 py-3 transition-colors hover:bg-cream-dark/60">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm font-medium text-zinc-800 truncate">
          {item.name}
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-zinc-500 border border-zinc-100">
            {LOCATION_ICONS[item.location]} {LOCATION_LABELS[item.location]}
          </span>
          <span className={ageClass(days)}>
            {days === 0 ? "Added today" : days === 1 ? "1 day ago" : `${days} days ago`}
          </span>
          {item.expires_at && (() => {
            const d = daysUntil(item.expires_at);
            return (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${expiryClass(d)}`}>
                {expiryLabel(d)}
              </span>
            );
          })()}
        </div>
      </div>
      <button
        onClick={handleRemove}
        disabled={removing}
        className="ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-sm active:scale-95 disabled:opacity-50"
        title="Remove item"
      >
        {removing ? "..." : "Remove"}
      </button>
    </div>
  );
}
