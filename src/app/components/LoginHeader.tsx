import React from "react";

const LoginHeader = () => {
  const handleLogin = () => {
    // Redirect to the login API route which handles the Google OAuth flow
    window.location.href = "/api/auth/login";
  };

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
      <button
        onClick={handleLogin}
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
    </div>
  );
};

export default LoginHeader;
