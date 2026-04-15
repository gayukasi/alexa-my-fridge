"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  Category,
  Location,
  CATEGORIES,
  CATEGORY_LABELS,
  LOCATION_LABELS,
} from "@/lib/types";

export default function AddItemForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("produce");
  const [location, setLocation] = useState<Location>("fridge");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const { error } = await getSupabase().from("fridge_items").insert({
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
      }
    } catch (err) {
      console.error("Failed to connect to Supabase:", err);
      alert("Failed to connect to database. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        className={inputClass}
      />

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

      <div>
        <label className="mb-1.5 block text-xs text-zinc-400">
          Expiry date (optional)
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
        className="mt-1 w-full rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gold-dark hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add to Fridge"}
      </button>
    </form>
  );
}
