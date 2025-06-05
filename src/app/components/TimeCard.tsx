"use client";

import { useState } from "react";

interface TimeCardProps {
  // Start time props
  startHour: number;
  startMinute: number;
  startDate: Date;
  onIncreaseStartHour: () => void;
  onDecreaseStartHour: () => void;
  onIncreaseStartMinute: () => void;
  onDecreaseStartMinute: () => void;
  onIncreaseStartDate: () => void;
  onDecreaseStartDate: () => void;
  isStartDateDecreaseDisabled: boolean;
  isStartHourDecreaseDisabled: boolean;
  isStartMinuteDecreaseDisabled: boolean;

  // End time props
  endHour: number;
  endMinute: number;
  endDate: Date;
  onIncreaseEndHour: () => void;
  onDecreaseEndHour: () => void;
  onIncreaseEndMinute: () => void;
  onDecreaseEndMinute: () => void;
  onIncreaseEndDate: () => void;
  onDecreaseEndDate: () => void;
  isEndDateDecreaseDisabled: boolean;
  isEndHourDecreaseDisabled: boolean;
  isEndMinuteDecreaseDisabled: boolean;
}

export default function TimeCard({
  startHour,
  startMinute,
  startDate,
  onIncreaseStartHour,
  onDecreaseStartHour,
  onIncreaseStartMinute,
  onDecreaseStartMinute,
  onIncreaseStartDate,
  onDecreaseStartDate,
  isStartDateDecreaseDisabled,
  isStartHourDecreaseDisabled,
  isStartMinuteDecreaseDisabled,
  endHour,
  endMinute,
  endDate,
  onIncreaseEndHour,
  onDecreaseEndHour,
  onIncreaseEndMinute,
  onDecreaseEndMinute,
  onIncreaseEndDate,
  onDecreaseEndDate,
  isEndDateDecreaseDisabled,
  isEndHourDecreaseDisabled,
  isEndMinuteDecreaseDisabled,
}: TimeCardProps) {
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const isStart = activeTab === "start";
  const currentHour = isStart ? startHour : endHour;
  const currentMinute = isStart ? startMinute : endMinute;
  const currentDate = isStart ? startDate : endDate;

  const onIncreaseHour = isStart ? onIncreaseStartHour : onIncreaseEndHour;
  const onDecreaseHour = isStart ? onDecreaseStartHour : onDecreaseEndHour;
  const onIncreaseMinute = isStart
    ? onIncreaseStartMinute
    : onIncreaseEndMinute;
  const onDecreaseMinute = isStart
    ? onDecreaseStartMinute
    : onDecreaseEndMinute;
  const onIncreaseDate = isStart ? onIncreaseStartDate : onIncreaseEndDate;
  const onDecreaseDate = isStart ? onDecreaseStartDate : onDecreaseEndDate;

  const isDateDecreaseDisabled = isStart
    ? isStartDateDecreaseDisabled
    : isEndDateDecreaseDisabled;
  const isHourDecreaseDisabled = isStart
    ? isStartHourDecreaseDisabled
    : isEndHourDecreaseDisabled;
  const isMinuteDecreaseDisabled = isStart
    ? isStartMinuteDecreaseDisabled
    : isEndMinuteDecreaseDisabled;

  const timeColor = isStart
    ? "text-green-600 dark:text-green-400"
    : "text-orange-600 dark:text-orange-400";

  return (
    <div className="flex flex-col justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Tab Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("start")}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === "start"
              ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Start Time
        </button>
        <button
          onClick={() => setActiveTab("end")}
          className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === "end"
              ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          End Time
        </button>
      </div>

      {/* Time Display and Controls */}
      <div className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className={`text-6xl font-bold ${timeColor}`}>
            {formatTime(currentHour, currentMinute)}
          </div>

          {/* Time Controls */}
          <div className="flex items-center space-x-4">
            {/* Date Control */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Date
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <button
                  onClick={onDecreaseDate}
                  disabled={isDateDecreaseDisabled}
                  className={`w-6 h-6 ${
                    isDateDecreaseDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-bold text-sm rounded transition-colors flex items-center justify-center`}
                >
                  -
                </button>
                <span className="text-sm font-semibold min-w-[120px] text-center">
                  {formatDate(currentDate)}
                </span>
                <button
                  onClick={onIncreaseDate}
                  className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-400">•</div>

            {/* Hour Control */}
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Hour
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                <button
                  onClick={onDecreaseHour}
                  disabled={isHourDecreaseDisabled}
                  className={`w-6 h-6 ${
                    isHourDecreaseDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-bold text-sm rounded transition-colors flex items-center justify-center`}
                >
                  -
                </button>
                <span className="text-lg font-semibold mx-3 min-w-[24px] text-center">
                  {currentHour.toString().padStart(2, "0")}
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
                  disabled={isMinuteDecreaseDisabled}
                  className={`w-6 h-6 ${
                    isMinuteDecreaseDisabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white font-bold text-sm rounded transition-colors flex items-center justify-center`}
                >
                  -
                </button>
                <span className="text-lg font-semibold mx-3 min-w-[24px] text-center">
                  {currentMinute.toString().padStart(2, "0")}
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
    </div>
  );
}
