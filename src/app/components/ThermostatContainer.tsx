"use client";

import { useState, useEffect } from "react";
import LoginHeader from "./LoginHeader";
import ThermostatSettings, {
  ThermostatData,
} from "@/app/components/ThermostatSettings";
import SchedulesCard from "@/app/components/SchedulesCard";

// Move Schedule interface and types from SchedulesCard
interface Schedule {
  id: number;
  temperature: number;
  startTime: string;
  endTime: string;
  date: string;
}

type FilterStatus = "active" | "completed" | "upcoming" | null;

export default function ThermostatContainer() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Current thermostat settings state
  const [currentSettings, setCurrentSettings] = useState<ThermostatData>(() => {
    const now = new Date();

    // Round to next 15-minute interval
    const currentMinutes = now.getMinutes();
    const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

    const startTime = new Date(now);
    if (roundedMinutes >= 60) {
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
    } else {
      startTime.setMinutes(roundedMinutes, 0, 0);
    }

    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours

    return {
      temperature: 25,
      startTime: {
        hour: startTime.getHours(),
        minute: startTime.getMinutes(),
        date: new Date(startTime),
      },
      endTime: {
        hour: endTime.getHours(),
        minute: endTime.getMinutes(),
        date: new Date(endTime),
      },
    };
  });

  // Schedules state moved from SchedulesCard
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      temperature: 22,
      startTime: "08:00",
      endTime: "18:00",
      date: "2024-01-15",
    },
    {
      id: 2,
      temperature: 25,
      startTime: "09:00",
      endTime: "17:00",
      date: "2024-01-16",
    },
    {
      id: 3,
      temperature: 20,
      startTime: "07:30",
      endTime: "19:00",
      date: "2024-01-14",
    },
    {
      id: 4,
      temperature: 24,
      startTime: "08:30",
      endTime: "16:30",
      date: "2024-01-17",
    },
    {
      id: 5,
      temperature: 21,
      startTime: "09:15",
      endTime: "18:45",
      date: "2024-01-13",
    },
  ]);

  // Filter state moved from SchedulesCard
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(null);

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
      // Create new schedule from current settings
      const newSchedule: Schedule = {
        id: Math.max(...schedules.map((s) => s.id), 0) + 1, // Generate unique ID
        temperature: currentSettings.temperature,
        startTime: `${currentSettings.startTime.hour
          .toString()
          .padStart(2, "0")}:${currentSettings.startTime.minute
          .toString()
          .padStart(2, "0")}`,
        endTime: `${currentSettings.endTime.hour
          .toString()
          .padStart(2, "0")}:${currentSettings.endTime.minute
          .toString()
          .padStart(2, "0")}`,
        date: currentSettings.startTime.date.toISOString().split("T")[0], // Use actual start date
      };

      // Add the new schedule to the state
      setSchedules((prevSchedules) => [...prevSchedules, newSchedule]);

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
      <ThermostatSettings
        onSettingsChange={handleSettingsChange}
        currentSettings={currentSettings}
      />

      {/* Schedule Display */}
      <SchedulesCard
        schedules={schedules}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />
    </div>
  );
}
