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

  return (
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
  );
}
