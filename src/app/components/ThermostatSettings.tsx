"use client";

import { useState } from "react";
import TemperatureCard from "@/app/components/TemperatureCard";
import StartTimeCard from "@/app/components/StartTimeCard";
import EndTimeCard from "@/app/components/EndTimeCard";

export interface ThermostatData {
  temperature: number;
  startTime: {
    hour: number;
    minute: number;
  };
  endTime: {
    hour: number;
    minute: number;
  };
}

interface ThermostatSettingsProps {
  onSettingsChange: (data: ThermostatData) => void;
}

export default function ThermostatSettings({
  onSettingsChange,
}: ThermostatSettingsProps) {
  const [temperature, setTemperature] = useState(25);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);

  const updateParent = (
    newTemp?: number,
    newStartHour?: number,
    newStartMinute?: number,
    newEndHour?: number,
    newEndMinute?: number
  ) => {
    const data: ThermostatData = {
      temperature: newTemp ?? temperature,
      startTime: {
        hour: newStartHour ?? startHour,
        minute: newStartMinute ?? startMinute,
      },
      endTime: {
        hour: newEndHour ?? endHour,
        minute: newEndMinute ?? endMinute,
      },
    };
    onSettingsChange(data);
  };

  const increaseTemp = () => {
    const newTemp = Math.min(temperature + 1, 32);
    setTemperature(newTemp);
    updateParent(newTemp);
  };

  const decreaseTemp = () => {
    const newTemp = Math.max(temperature - 1, 12);
    setTemperature(newTemp);
    updateParent(newTemp);
  };

  const increaseHour = () => {
    const newHour = (startHour + 1) % 24;
    setStartHour(newHour);
    updateParent(undefined, newHour);
  };

  const decreaseHour = () => {
    const newHour = (startHour - 1 + 24) % 24;
    setStartHour(newHour);
    updateParent(undefined, newHour);
  };

  const increaseMinute = () => {
    const newMinute = (startMinute + 15) % 60;
    setStartMinute(newMinute);
    updateParent(undefined, undefined, newMinute);
  };

  const decreaseMinute = () => {
    const newMinute = (startMinute - 15 + 60) % 60;
    setStartMinute(newMinute);
    updateParent(undefined, undefined, newMinute);
  };

  const increaseEndHour = () => {
    const newEndHour = (endHour + 1) % 24;
    setEndHour(newEndHour);
    updateParent(undefined, undefined, undefined, newEndHour);
  };

  const decreaseEndHour = () => {
    const newEndHour = (endHour - 1 + 24) % 24;
    setEndHour(newEndHour);
    updateParent(undefined, undefined, undefined, newEndHour);
  };

  const increaseEndMinute = () => {
    const newEndMinute = (endMinute + 15) % 60;
    setEndMinute(newEndMinute);
    updateParent(undefined, undefined, undefined, undefined, newEndMinute);
  };

  const decreaseEndMinute = () => {
    const newEndMinute = (endMinute - 15 + 60) % 60;
    setEndMinute(newEndMinute);
    updateParent(undefined, undefined, undefined, undefined, newEndMinute);
  };

  return (
    <div className="space-y-6">
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
