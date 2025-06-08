"use client";

import { useState, useEffect } from "react";
import LoginHeader from "./LoginHeader";
import ThermostatSettings, {
  ThermostatData,
} from "@/app/components/ThermostatSettings";
import SchedulesCard from "@/app/components/SchedulesCard";
import { Schedule } from "@/lib/types/types";

type FilterStatus = "active" | "completed" | "upcoming" | null;

export default function ThermostatContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [currentSettings, setCurrentSettings] = useState<ThermostatData>(() => {
    const now = new Date();

    const currentMinutes = now.getMinutes();
    const roundedMinutes = Math.ceil(currentMinutes / 15) * 15;

    const startTime = new Date(now);
    if (roundedMinutes >= 60) {
      startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
    } else {
      startTime.setMinutes(roundedMinutes, 0, 0);
    }

    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

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

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(null);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      setUserId(data.user_id);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUserId(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleSettingsChange = (newSettings: ThermostatData) => {
    setCurrentSettings(newSettings);
  };

  const handleSubmitSchedule = async () => {
    console.log("Submitting schedule:", currentSettings);

    try {
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules?userId=${userId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          console.error("Error fetching schedules:", result.error);
          setSchedules([]);
        } else {
          setSchedules(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setSchedules([]);
      }
    };

    if (isAuthenticated && userId) {
      fetchSchedules();
    }
  }, [isAuthenticated, userId]);

  return (
    <div className="space-y-4">
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
