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
    console.log("API Request:", { url: config.url, method: config.method, token }); // Debug log
    // Only exclude public endpoints from requiring the Authorization header
    const isPublicEndpoint =
      (config.url === "/jobs" && config.method === "get") || // GET /api/jobs
      (config.url.startsWith("/jobs/") && config.method === "get" && !config.url.includes("employer")); // GET /api/jobs/:slug

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;