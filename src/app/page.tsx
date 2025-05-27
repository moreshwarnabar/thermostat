"use client";

import { useState } from "react";

export default function Home() {
  const [temperature, setTemperature] = useState(72);

  const increaseTemp = () => {
    setTemperature((prev) => Math.min(prev + 1, 90)); // Max temp 90°F
  };

  const decreaseTemp = () => {
    setTemperature((prev) => Math.max(prev - 1, 50)); // Min temp 50°F
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">
          Thermostat Schedule Control
        </h1>

        {/* Cards Container - Column on mobile/tablet, Row on large screens */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
          {/* Card 1 - Temperature Control */}
          <div className="flex-1 flex flex-col justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {/* Temperature Display and Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {temperature}°F
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={decreaseTemp}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl rounded-full transition-colors flex items-center justify-center"
                  disabled={temperature <= 50}
                >
                  -
                </button>

                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[100px] text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Target Temp
                  </span>
                </div>

                <button
                  onClick={increaseTemp}
                  className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-full transition-colors flex items-center justify-center"
                  disabled={temperature >= 90}
                >
                  +
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                Range: 50°F - 90°F
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Feature Two
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Here&apos;s another placeholder description for the second
                feature card. This section highlights different capabilities and
                demonstrates the versatility of the platform&apos;s offerings.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Get Started
            </button>
          </div>

          {/* Card 3 */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Feature Three
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                This final placeholder card showcases the third major feature.
                It complements the other features and provides users with a
                comprehensive solution for their needs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
            </div>
            <button className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Explore
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
