// API Helper để gọi backend
const API_URL = "http://localhost:5001/api";

export const authAPI = {
  signup: async (name, phone, email, password, role) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, role }),
    });
    return response.json();
  },

  login: async (email, password, role) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    return response.json();
  },
};

