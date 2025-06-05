import React, { useState } from "react";

interface Schedule {
  id: number;
  temperature: number;
  startTime: string;
  endTime: string;
  date: string;
  status: "active" | "completed" | "upcoming";
}

type FilterStatus = "active" | "completed" | "upcoming" | null;

const SchedulesCard: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(null);

  // Dummy data for schedules
  const schedules: Schedule[] = [
    {
      id: 1,
      temperature: 22,
      startTime: "08:00",
      endTime: "18:00",
      date: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      temperature: 25,
      startTime: "09:00",
      endTime: "17:00",
      date: "2024-01-16",
      status: "upcoming",
    },
    {
      id: 3,
      temperature: 20,
      startTime: "07:30",
      endTime: "19:00",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 4,
      temperature: 24,
      startTime: "08:30",
      endTime: "16:30",
      date: "2024-01-17",
      status: "upcoming",
    },
    {
      id: 5,
      temperature: 21,
      startTime: "09:15",
      endTime: "18:45",
      date: "2024-01-13",
      status: "completed",
    },
  ];

  // Filter schedules based on selected status
  const filteredSchedules = schedules.filter(
    (schedule) => filterStatus === null || schedule.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
      case "upcoming":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900";
      case "completed":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  const getFilterButtonColor = (status: FilterStatus) => {
    const isActive = filterStatus === status;
    if (isActive) {
      switch (status) {
        case "active":
          return "bg-green-600 text-white hover:bg-green-700";
        case "upcoming":
          return "bg-blue-600 text-white hover:bg-blue-700";
        case "completed":
          return "bg-gray-600 text-white hover:bg-gray-700";
        default:
          return "bg-blue-600 text-white hover:bg-blue-700";
      }
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
  };

  const getStatusCount = (status: FilterStatus) => {
    if (status === null) return schedules.length;
    return schedules.filter((schedule) => schedule.status === status).length;
  };

  const handleFilterClick = (status: FilterStatus) => {
    // Toggle filter: if clicking the same filter, deselect it (set to null)
    setFilterStatus(filterStatus === status ? null : status);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Schedule History
        </h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "active", label: "Active" },
              { key: "upcoming", label: "Upcoming" },
              { key: "completed", label: "Completed" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleFilterClick(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${getFilterButtonColor(
                key
              )}`}
            >
              <span>{label}</span>
              <span className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold">
                {getStatusCount(key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Temperature
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Start Time
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                End Time
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                  {formatDate(schedule.date)}
                </td>
                <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                  <span className="inline-flex items-center">
                    {schedule.temperature}°C
                    <svg
                      className="w-4 h-4 ml-1 text-orange-500 dark:text-orange-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-10a4 4 0 100 8 4 4 0 000-8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-mono">
                  {schedule.startTime}
                </td>
                <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-mono">
                  {schedule.endTime}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                      schedule.status
                    )}`}
                  >
                    {schedule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg">
            {filterStatus === null
              ? "No schedules found"
              : `No ${filterStatus} schedules found`}
          </p>
          <p className="text-sm">
            {filterStatus === null
              ? "Create your first schedule to get started"
              : `Try selecting a different filter or create a new ${filterStatus} schedule`}
          </p>
        </div>
      )}
    </div>
  );
};

export default SchedulesCard;
