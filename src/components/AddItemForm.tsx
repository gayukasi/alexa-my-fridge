"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Category,
  Location,
  CATEGORIES,
  CATEGORY_LABELS,
  LOCATION_LABELS,
} from "@/lib/types";

export default function AddItemForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("produce");
  const [location, setLocation] = useState<Location>("fridge");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("fridge_items").insert({
      name: name.trim(),
      category,
      location,
      added_at: new Date().toISOString(),
      expires_at: expiresAt || null,
    });

    if (error) {
      console.error("Error adding item:", error.message, error.details, error.hint);
      alert(`Failed to add item: ${error.message}`);
    } else {
      setName("");
      setExpiresAt("");
      onAdded();
    }
    setLoading(false);
  }

  const inputClass =
    "w-full rounded-xl border border-orange-200/80 bg-white/80 px-3 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-orange-700/70">
          Item name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Greek yogurt"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-orange-700/70">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-orange-700/70">
          Location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as Location)}
          className={inputClass}
        >
          {(["fridge", "freezer", "pantry"] as Location[]).map((l) => (
            <option key={l} value={l}>
              {LOCATION_LABELS[l]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-orange-700/70">
          Expires (optional)
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="mt-1 w-full rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add to Fridge"}
      </button>
    </form>
  );
}
