"use client";

import ThermostatContainer from "@/app/components/ThermostatContainer";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-7xl mx-auto">
        {/* Cards Container - Column on mobile/tablet, Row on large screens */}
        <ThermostatContainer />
      </main>
    </div>
  );
}
