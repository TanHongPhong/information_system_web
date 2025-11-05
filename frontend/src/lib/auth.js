// frontend/src/lib/auth.js
// Utility functions for authentication

/**
 * Clear all authentication data from localStorage
 */
export const clearAuth = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("gd_user");
  localStorage.removeItem("role");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("remember");
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem("gd_user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

