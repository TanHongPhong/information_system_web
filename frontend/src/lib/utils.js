import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Get API URL - tự động detect production
export const getApiUrl = () => {
  // Nếu có VITE_API_URL trong env, dùng nó
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Nếu đang ở localhost (development), dùng localhost:5001
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return "http://localhost:5001/api";
  }
  
  // Production: dùng relative URL (sẽ được proxy bởi Nginx)
  return "/api";
};