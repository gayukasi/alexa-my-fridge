export type Category = "produce" | "dairy" | "leftovers" | "condiments" | "other";
export type Location = "fridge" | "freezer" | "pantry";

export interface FridgeItem {
  id: string;
  name: string;
  category: Category;
  location: Location;
  added_at: string;
  expires_at: string | null;
}

export const CATEGORIES: Category[] = [
  "produce",
  "dairy",
  "leftovers",
  "condiments",
  "other",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  leftovers: "Leftovers",
  condiments: "Condiments",
  other: "Other",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  produce: "🥬",
  dairy: "🧀",
  leftovers: "🍱",
  condiments: "🫙",
  other: "📦",
};

export const LOCATION_LABELS: Record<Location, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  pantry: "Pantry",
};
