export const dynamic = "force-dynamic";

import FridgeInventory from "@/components/FridgeInventory";
export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <div className="mb-3 text-5xl">🧊</div>
          <h1 className="text-3xl font-bold tracking-tight text-sage">
            Sort My Fridge
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Keep track of what&apos;s fresh, what&apos;s expiring, and what needs to go
          </p>
        </header>

        <FridgeInventory />
      </main>
    </div>
  );
}
