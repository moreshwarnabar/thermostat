"use client";

import { useState, useEffect } from "react";
import LoginHeader from "./LoginHeader";
import ThermostatSettings, {
  ThermostatData,
} from "@/app/components/ThermostatSettings";
import SchedulesCard from "@/app/components/SchedulesCard";
import { NewSchedule, Schedule } from "@/lib/types/types";
import { ScheduleTable } from "@/lib/services/schedules";

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

  const transformSchedule = (schedule: ScheduleTable): Schedule => {
    return {
      id: schedule.id,
      temperature: schedule.temperature,
      startTime: new Date(schedule.start_time as string).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ),
      endTime: new Date(schedule.end_time as string).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ),
      date: new Date(schedule.start_time as string).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          weekday: "short",
        }
      ),
      status:
        new Date(schedule.start_time as string) > new Date()
          ? "upcoming"
          : new Date(schedule.end_time as string) < new Date()
          ? "completed"
          : "active",
    };
  };

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleSettingsChange = (newSettings: ThermostatData) => {
    setCurrentSettings({
      ...newSettings,
      startTime: {
        ...newSettings.startTime,
        date: new Date(newSettings.startTime.date),
      },
      endTime: {
        ...newSettings.endTime,
        date: new Date(newSettings.endTime.date),
      },
    });
  };

  const handleSubmitSchedule = async () => {
    console.log("Submitting schedule:", currentSettings);

    try {
      const newSchedule: NewSchedule = {
        temperature: currentSettings.temperature,
        start_time: new Date(
          currentSettings.startTime.date.getFullYear(),
          currentSettings.startTime.date.getMonth(),
          currentSettings.startTime.date.getDate(),
          currentSettings.startTime.hour,
          currentSettings.startTime.minute,
          0,
          0
        ).toISOString(),
        end_time: new Date(
          currentSettings.endTime.date.getFullYear(),
          currentSettings.endTime.date.getMonth(),
          currentSettings.endTime.date.getDate(),
          currentSettings.endTime.hour,
          currentSettings.endTime.minute,
          0,
          0
        ).toISOString(),
        user_id: userId as string,
      };

      console.log("New schedule:", newSchedule);

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        console.error("Error submitting schedule:", result.error);
      } else {
        setSchedules((prevSchedules) => [
          ...prevSchedules,
          transformSchedule(result.data),
        ]);
      }
    } catch (error) {
      console.error("Error submitting schedule:", error);
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
          setSchedules(result.data.map(transformSchedule));
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
