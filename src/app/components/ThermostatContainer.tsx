"use client";

import { useState, useEffect } from "react";
import LoginHeader from "./LoginHeader";
import ThermostatSettings, {
  ThermostatData,
} from "@/app/components/ThermostatSettings";
import ScheduleDisplay from "@/app/components/ScheduleDisplay";

export default function ThermostatContainer() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Current thermostat settings state
  const [currentSettings, setCurrentSettings] = useState<ThermostatData>({
    temperature: 25,
    startTime: { hour: 8, minute: 0 },
    endTime: { hour: 18, minute: 0 },
  });

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

  const handleSettingsChange = (newSettings: ThermostatData) => {
    setCurrentSettings(newSettings);
  };

  const handleSubmitSchedule = async () => {
    console.log("Submitting schedule:", currentSettings);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/schedule', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(currentSettings),
      // });

      alert(
        `Schedule submitted!\nTemperature: ${
          currentSettings.temperature
        }°C\nStart: ${currentSettings.startTime.hour
          .toString()
          .padStart(2, "0")}:${currentSettings.startTime.minute
          .toString()
          .padStart(2, "0")}\nEnd: ${currentSettings.endTime.hour
          .toString()
          .padStart(2, "0")}:${currentSettings.endTime.minute
          .toString()
          .padStart(2, "0")}`
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

      {/* Thermostat Settings */}
      <ThermostatSettings onSettingsChange={handleSettingsChange} />

      {/* Schedule Display */}
      <ScheduleDisplay />
    </div>
  );
}
