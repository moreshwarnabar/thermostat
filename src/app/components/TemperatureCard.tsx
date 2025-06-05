"use client";

interface TemperatureCardProps {
  temperature: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function TemperatureCard({
  temperature,
  onIncrease,
  onDecrease,
}: TemperatureCardProps) {
  return (
    <div className="flex-1 flex flex-col justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Temperature Display and Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
          {temperature}°C
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onDecrease}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-2xl rounded-full transition-colors flex items-center justify-center"
            disabled={temperature <= 12}
          >
            -
          </button>

          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[100px] text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Target Temp
            </span>
          </div>

          <button
            onClick={onIncrease}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-full transition-colors flex items-center justify-center"
            disabled={temperature >= 32}
          >
            +
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Range: 12°C - 32°C
        </div>
      </div>
    </div>
  );
}
