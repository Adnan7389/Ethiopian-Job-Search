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
    } else if (!token && !isPublicEndpoint) {
      console.log("No token found in localStorage for a protected endpoint");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 Unauthorized detected:", error.response.data.message);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;