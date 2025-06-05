"use client";

import { useState, useEffect } from "react";
import TemperatureCard from "@/app/components/TemperatureCard";
import StartTimeCard from "@/app/components/StartTimeCard";
import EndTimeCard from "@/app/components/EndTimeCard";
import LoginHeader from "./LoginHeader";

export default function ThermostatContainer() {
  const [temperature, setTemperature] = useState(25);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect to the login API route which handles the Google OAuth flow
    window.location.href = "/api/auth/login";
  };

  const handleLogout = () => {
    // Redirect to logout API route
    window.location.href = "/api/auth/logout";
  };

  const increaseTemp = () => {
    setTemperature((prev) => Math.min(prev + 1, 32)); // Max temp 32°C
  };

  const decreaseTemp = () => {
    setTemperature((prev) => Math.max(prev - 1, 12)); // Min temp 12°C
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

  const handleSubmitSchedule = async () => {
    const scheduleData = {
      temperature,
      startTime: {
        hour: startHour,
        minute: startMinute,
      },
      endTime: {
        hour: endHour,
        minute: endMinute,
      },
    };

    console.log("Submitting schedule:", scheduleData);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/schedule', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(scheduleData),
      // });

      alert(
        `Schedule submitted!\nTemperature: ${temperature}°C\nStart: ${startHour
          .toString()
          .padStart(2, "0")}:${startMinute
          .toString()
          .padStart(2, "0")}\nEnd: ${endHour
          .toString()
          .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`
      );
    } catch (error) {
      console.error("Error submitting schedule:", error);
      alert("Failed to submit schedule. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Login Button */}
      <LoginHeader
        onSubmitSchedule={handleSubmitSchedule}
        isAuthenticated={isAuthenticated}
        isAuthLoading={isAuthLoading}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
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
