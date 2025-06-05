"use client";

import { useState } from "react";
import StartTimeCard from "@/app/components/StartTimeCard";
import EndTimeCard from "@/app/components/EndTimeCard";

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

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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

      {/* Conditional Component Rendering */}
      <div className="flex-1">
        {activeTab === "start" ? (
          <StartTimeCard
            hour={startHour}
            minute={startMinute}
            date={startDate}
            onIncreaseHour={onIncreaseStartHour}
            onDecreaseHour={onDecreaseStartHour}
            onIncreaseMinute={onIncreaseStartMinute}
            onDecreaseMinute={onDecreaseStartMinute}
            onIncreaseDate={onIncreaseStartDate}
            onDecreaseDate={onDecreaseStartDate}
            isDateDecreaseDisabled={isStartDateDecreaseDisabled}
            isHourDecreaseDisabled={isStartHourDecreaseDisabled}
            isMinuteDecreaseDisabled={isStartMinuteDecreaseDisabled}
          />
        ) : (
          <EndTimeCard
            hour={endHour}
            minute={endMinute}
            date={endDate}
            onIncreaseHour={onIncreaseEndHour}
            onDecreaseHour={onDecreaseEndHour}
            onIncreaseMinute={onIncreaseEndMinute}
            onDecreaseMinute={onDecreaseEndMinute}
            onIncreaseDate={onIncreaseEndDate}
            onDecreaseDate={onDecreaseEndDate}
            isDateDecreaseDisabled={isEndDateDecreaseDisabled}
            isHourDecreaseDisabled={isEndHourDecreaseDisabled}
            isMinuteDecreaseDisabled={isEndMinuteDecreaseDisabled}
          />
        )}
      </div>
    </div>
  );
}
