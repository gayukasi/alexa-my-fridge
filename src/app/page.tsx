export const dynamic = "force-dynamic";

import FridgeInventory from "@/components/FridgeInventory";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero / Nav bar */}
      <nav className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-light text-lg">
              🧊
            </div>
            <div>
              <h1 className="text-lg font-bold text-bark">Sort My Fridge</h1>
              <p className="text-xs text-zinc-400">Fresh. Tracked. Sorted.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-500">
            <span className="cursor-default font-medium text-gold">Inventory</span>
            <span className="cursor-default">Expiring</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <FridgeInventory />
      </main>
    </div>
  );
}
