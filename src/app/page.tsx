"use client";

import ThermostatContainer from "@/app/components/ThermostatContainer";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">
          Thermostat Schedule Control
        </h1>

        {/* Cards Container - Column on mobile/tablet, Row on large screens */}
        <ThermostatContainer />
      </main>
    </div>
  );
}
