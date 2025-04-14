import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Request:", { url: config.url, method: config.method, token });
    const isPublicEndpoint =
      (config.url === "/jobs" && config.method === "get") ||
      (config.url.startsWith("/jobs/") && config.method === "get" && !config.url.includes("employer"));

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;