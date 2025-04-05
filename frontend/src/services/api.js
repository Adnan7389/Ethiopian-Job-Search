import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // Only add the Authorization header if a token exists and the endpoint requires authentication
    if (token && !config.url.includes("/jobs") && !config.url.includes("/jobs/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;