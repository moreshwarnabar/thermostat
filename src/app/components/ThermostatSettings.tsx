"use client";

import { useState } from "react";
import TemperatureCard from "@/app/components/TemperatureCard";
import TimeCard from "@/app/components/TimeCard";

export interface ThermostatData {
  temperature: number;
  startTime: {
    hour: number;
    minute: number;
    date: Date;
  };
  endTime: {
    hour: number;
    minute: number;
    date: Date;
  };
}

interface ThermostatSettingsProps {
  onSettingsChange: (data: ThermostatData) => void;
}

export default function ThermostatSettings({
  onSettingsChange,
}: ThermostatSettingsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for consistency

  const [temperature, setTemperature] = useState(25);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [startDate, setStartDate] = useState(new Date(today));
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);
  const [endDate, setEndDate] = useState(new Date(today));

  // Helper functions to check if decrease buttons should be disabled
  const isStartDateDecreaseDisabled = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 1);
    const testDate = new Date(newDate);
    testDate.setHours(startHour, startMinute, 0, 0);
    return testDate <= new Date();
  };

  const isStartHourDecreaseDisabled = () => {
    const newHour = (startHour - 1 + 24) % 24;
    const testDate = new Date(startDate);
    testDate.setHours(newHour, startMinute, 0, 0);
    return testDate <= new Date();
  };

  const isStartMinuteDecreaseDisabled = () => {
    const newMinute = (startMinute - 15 + 60) % 60;
    const testDate = new Date(startDate);
    testDate.setHours(startHour, newMinute, 0, 0);
    return testDate <= new Date();
  };

  const isEndDateDecreaseDisabled = () => {
    const newDate = new Date(endDate);
    newDate.setDate(newDate.getDate() - 1);
    const testDate = new Date(newDate);
    testDate.setHours(endHour, endMinute, 0, 0);
    return testDate <= new Date();
  };

  const isEndHourDecreaseDisabled = () => {
    const newHour = (endHour - 1 + 24) % 24;
    const testDate = new Date(endDate);
    testDate.setHours(newHour, endMinute, 0, 0);
    return testDate <= new Date();
  };

  const isEndMinuteDecreaseDisabled = () => {
    const newMinute = (endMinute - 15 + 60) % 60;
    const testDate = new Date(endDate);
    testDate.setHours(endHour, newMinute, 0, 0);
    return testDate <= new Date();
  };

  const updateParent = (
    newTemp?: number,
    newStartHour?: number,
    newStartMinute?: number,
    newStartDate?: Date,
    newEndHour?: number,
    newEndMinute?: number,
    newEndDate?: Date
  ) => {
    const data: ThermostatData = {
      temperature: newTemp ?? temperature,
      startTime: {
        hour: newStartHour ?? startHour,
        minute: newStartMinute ?? startMinute,
        date: newStartDate ?? startDate,
      },
      endTime: {
        hour: newEndHour ?? endHour,
        minute: newEndMinute ?? endMinute,
        date: newEndDate ?? endDate,
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
    const testDate = new Date(startDate);
    testDate.setHours(newHour, startMinute, 0, 0);

    // Don't allow setting a time in the past
    if (testDate <= new Date()) {
      return;
    }

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
    const testDate = new Date(startDate);
    testDate.setHours(startHour, newMinute, 0, 0);

    // Don't allow setting a time in the past
    if (testDate <= new Date()) {
      return;
    }

    setStartMinute(newMinute);
    updateParent(undefined, undefined, newMinute);
  };

  const increaseStartDate = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 1);
    setStartDate(newDate);
    updateParent(undefined, undefined, undefined, newDate);
  };

  const decreaseStartDate = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 1);
    const testDate = new Date(newDate);
    testDate.setHours(startHour, startMinute, 0, 0);

    // Don't allow setting a date/time in the past
    if (testDate <= new Date()) {
      return;
    }

    setStartDate(newDate);
    updateParent(undefined, undefined, undefined, newDate);
  };

  const increaseEndHour = () => {
    const newEndHour = (endHour + 1) % 24;
    setEndHour(newEndHour);
    updateParent(undefined, undefined, undefined, undefined, newEndHour);
  };

  const decreaseEndHour = () => {
    const newEndHour = (endHour - 1 + 24) % 24;
    const testDate = new Date(endDate);
    testDate.setHours(newEndHour, endMinute, 0, 0);

    // Don't allow setting a time in the past
    if (testDate <= new Date()) {
      return;
    }

    setEndHour(newEndHour);
    updateParent(undefined, undefined, undefined, undefined, newEndHour);
  };

  const increaseEndMinute = () => {
    const newEndMinute = (endMinute + 15) % 60;
    setEndMinute(newEndMinute);
    updateParent(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newEndMinute
    );
  };

  const decreaseEndMinute = () => {
    const newEndMinute = (endMinute - 15 + 60) % 60;
    const testDate = new Date(endDate);
    testDate.setHours(endHour, newEndMinute, 0, 0);

    // Don't allow setting a time in the past
    if (testDate <= new Date()) {
      return;
    }

    setEndMinute(newEndMinute);
    updateParent(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newEndMinute
    );
  };

  const increaseEndDate = () => {
    const newDate = new Date(endDate);
    newDate.setDate(newDate.getDate() + 1);
    setEndDate(newDate);
    updateParent(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newDate
    );
  };

  const decreaseEndDate = () => {
    const newDate = new Date(endDate);
    newDate.setDate(newDate.getDate() - 1);
    const testDate = new Date(newDate);
    testDate.setHours(endHour, endMinute, 0, 0);

    // Don't allow setting a date/time in the past
    if (testDate <= new Date()) {
      return;
    }

    setEndDate(newDate);
    updateParent(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      newDate
    );
  };

  return (
    <div className="space-y-6">
      {/* Thermostat Controls */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-6">
        <div className="lg:w-2/5">
          <TemperatureCard
            temperature={temperature}
            onIncrease={increaseTemp}
            onDecrease={decreaseTemp}
          />
        </div>

        <div className="lg:w-3/5">
          <TimeCard
            startHour={startHour}
            startMinute={startMinute}
            startDate={startDate}
            onIncreaseStartHour={increaseHour}
            onDecreaseStartHour={decreaseHour}
            onIncreaseStartMinute={increaseMinute}
            onDecreaseStartMinute={decreaseMinute}
            onIncreaseStartDate={increaseStartDate}
            onDecreaseStartDate={decreaseStartDate}
            isStartDateDecreaseDisabled={isStartDateDecreaseDisabled()}
            isStartHourDecreaseDisabled={isStartHourDecreaseDisabled()}
            isStartMinuteDecreaseDisabled={isStartMinuteDecreaseDisabled()}
            endHour={endHour}
            endMinute={endMinute}
            endDate={endDate}
            onIncreaseEndHour={increaseEndHour}
            onDecreaseEndHour={decreaseEndHour}
            onIncreaseEndMinute={increaseEndMinute}
            onDecreaseEndMinute={decreaseEndMinute}
            onIncreaseEndDate={increaseEndDate}
            onDecreaseEndDate={decreaseEndDate}
            isEndDateDecreaseDisabled={isEndDateDecreaseDisabled()}
            isEndHourDecreaseDisabled={isEndHourDecreaseDisabled()}
            isEndMinuteDecreaseDisabled={isEndMinuteDecreaseDisabled()}
          />
        </div>
      </div>
    </div>
  );
}
