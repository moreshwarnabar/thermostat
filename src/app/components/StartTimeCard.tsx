"use client";

interface StartTimeCardProps {
  hour: number;
  minute: number;
  onIncreaseHour: () => void;
  onDecreaseHour: () => void;
  onIncreaseMinute: () => void;
  onDecreaseMinute: () => void;
}

export default function StartTimeCard({
  hour,
  minute,
  onIncreaseHour,
  onDecreaseHour,
  onIncreaseMinute,
  onDecreaseMinute,
}: StartTimeCardProps) {
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Time Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl font-bold text-green-600 dark:text-green-400">
          {formatTime(hour, minute)}
        </div>

        {/* Time Controls */}
        <div className="flex items-center space-x-4">
          {/* Hour Control */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Hour
            </span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
              <button
                onClick={onDecreaseHour}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="text-lg font-semibold mx-3 min-w-[24px] text-center">
                {hour.toString().padStart(2, "0")}
              </span>
              <button
                onClick={onIncreaseHour}
                className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-2xl font-bold text-gray-400">:</div>

          {/* Minute Control */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-gray-600 dark:text-gray-300">
              Minutes
            </span>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
              <button
                onClick={onDecreaseMinute}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded transition-colors flex items-center justify-center"
              >
                -
              </button>
              <span className="text-lg font-semibold mx-3 min-w-[24px] text-center">
                {minute.toString().padStart(2, "0")}
              </span>
              <button
                onClick={onIncreaseMinute}
                className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          24-hour format • 15-minute intervals
        </div>
      </div>
    </div>
  );
}
