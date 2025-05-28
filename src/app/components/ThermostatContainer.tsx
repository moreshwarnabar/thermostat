"use client";

import { useState } from "react";
import TemperatureCard from "@/app/components/TemperatureCard";
import StartTimeCard from "@/app/components/StartTimeCard";
import EndTimeCard from "@/app/components/EndTimeCard";

export default function ThermostatContainer() {
  const [temperature, setTemperature] = useState(72);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);

  const increaseTemp = () => {
    setTemperature((prev) => Math.min(prev + 1, 90)); // Max temp 90°F
  };

  const decreaseTemp = () => {
    setTemperature((prev) => Math.max(prev - 1, 50)); // Min temp 50°F
  };

  const increaseHour = () => {
    setStartHour((prev) => (prev + 1) % 24);
  };

  const decreaseHour = () => {
    setStartHour((prev) => (prev - 1 + 24) % 24);
  };

  const increaseMinute = () => {
    setStartMinute((prev) => (prev + 15) % 60);
  };

  const decreaseMinute = () => {
    setStartMinute((prev) => (prev - 15 + 60) % 60);
  };

  const increaseEndHour = () => {
    setEndHour((prev) => (prev + 1) % 24);
  };

  const decreaseEndHour = () => {
    setEndHour((prev) => (prev - 1 + 24) % 24);
  };

  const increaseEndMinute = () => {
    setEndMinute((prev) => (prev + 15) % 60);
  };

  const decreaseEndMinute = () => {
    setEndMinute((prev) => (prev - 15 + 60) % 60);
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="space-y-8">
      {/* Header with Login Button */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Smart Thermostat Control
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your home temperature schedule
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span>Login</span>
        </button>
      </div>

      {/* Thermostat Controls */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
        <TemperatureCard
          temperature={temperature}
          onIncrease={increaseTemp}
          onDecrease={decreaseTemp}
        />

        <StartTimeCard
          hour={startHour}
          minute={startMinute}
          onIncreaseHour={increaseHour}
          onDecreaseHour={decreaseHour}
          onIncreaseMinute={increaseMinute}
          onDecreaseMinute={decreaseMinute}
        />

        <EndTimeCard
          hour={endHour}
          minute={endMinute}
          onIncreaseHour={increaseEndHour}
          onDecreaseHour={decreaseEndHour}
          onIncreaseMinute={increaseEndMinute}
          onDecreaseMinute={decreaseEndMinute}
        />
      </div>
    </div>
  );
}
