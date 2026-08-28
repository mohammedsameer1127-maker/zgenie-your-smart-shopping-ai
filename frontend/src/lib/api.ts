import axios from "axios";
import { auth } from "./firebase";

// Create an Axios instance pointing to the FastAPI backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Firebase ID Token
api.interceptors.request.use(
  async (config) => {
    // Attempt to get current user from Firebase auth
    const user = auth.currentUser;
    if (user) {
      // Force refresh only if token is expired, otherwise returns cached token
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g. log user out, redirect to login)
      console.warn("Unauthorized access - token may be expired or invalid");
    }
    return Promise.reject(error);
  }
);

export default api;
