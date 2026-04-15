"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { FridgeItem as FridgeItemType, LOCATION_LABELS } from "@/lib/types";

function daysAgo(dateStr: string): number {
  const added = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24));
}

function ageColor(days: number): string {
  if (days >= 7) return "text-red-500";
  if (days >= 5) return "text-amber-500";
  return "text-zinc-400";
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function expiryBadge(days: number): { text: string; cls: string } {
  if (days < 0) return { text: `Expired`, cls: "bg-red-50 text-red-500" };
  if (days === 0) return { text: "Today", cls: "bg-amber-50 text-amber-600" };
  if (days <= 2) return { text: `${days}d left`, cls: "bg-amber-50 text-amber-600" };
  return { text: `${days}d left`, cls: "bg-zinc-50 text-zinc-400" };
}

const LOCATION_ICONS: Record<string, string> = {
  fridge: "❄️",
  freezer: "🧊",
  pantry: "🏠",
};

export default function FridgeItemRow({ item }: { item: FridgeItemType }) {
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
  }

  return (
    <div className="group relative flex items-start gap-3.5 rounded-2xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm">
      {/* Location icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-base">
        {LOCATION_ICONS[item.location]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-bark truncate">{item.name}</p>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="shrink-0 rounded-lg p-1 text-zinc-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 disabled:opacity-50"
            title="Remove"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-sand px-2 py-0.5 text-xs text-zinc-500">
            {LOCATION_LABELS[item.location]}
          </span>
          <span className={`text-xs ${ageColor(days)}`}>
            {days === 0 ? "Today" : `${days}d ago`}
          </span>
          {item.expires_at && (() => {
            const d = daysUntil(item.expires_at);
            const badge = expiryBadge(d);
            return (
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                {badge.text}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
