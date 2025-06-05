import React from "react";

interface LoginHeaderProps {
  onSubmitSchedule: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const LoginHeader = ({
  onSubmitSchedule,
  isAuthenticated,
  isAuthLoading,
  onLogin,
  onLogout,
}: LoginHeaderProps) => {
  if (isAuthLoading) {
    return (
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Smart Thermostat Control
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your home temperature schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-6 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg flex items-center space-x-2">
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Smart Thermostat Control
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your home temperature schedule
          {isAuthenticated && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Authenticated
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onSubmitSchedule}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>Submit Schedule</span>
        </button>

        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={onLogin}
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
              />
            </svg>
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginHeader;
