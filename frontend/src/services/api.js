import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Backend base URL
const BACKEND_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    const isPublicEndpoint =
      (config.url === "/jobs" && config.method === "get") ||
      (config.url.match(/^\/jobs\/\d+$/) && config.method === "get");

    const isAuthEndpoint =
      config.url === "/auth/login" ||
      config.url === "/auth/register" ||
      config.url === "/auth/resend-code" ||
      config.url === "/auth/verify-code" ||
      config.url === "/auth/forgot-password" ||
      config.url === "/auth/verify-reset-code" ||
      config.url === "/auth/reset-password" ||
      config.url === "/auth/refresh-token";

    if (token && !isPublicEndpoint && !isAuthEndpoint) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime + 300) {
        console.log(`Request to ${config.url}: Token expires at ${new Date(decodedToken.exp * 1000).toISOString()}`);
        if (!isRefreshing) {
          isRefreshing = true;
          console.log("Refreshing token...");
          try {
            const response = await axios.post(`${BACKEND_BASE_URL}/auth/refresh-token`, {
              refreshToken,
            });
            const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem("token", newToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            config.headers.Authorization = `Bearer ${newToken}`;
            console.log("Token refreshed successfully:", newToken);
            processQueue(null, newToken);
          } catch (error) {
            console.error("Token refresh failed:", error.response?.data || error.message);
            processQueue(error);
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else {
          const retryRequest = new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          const newToken = await retryRequest;
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage =
        error.response.data.error ||
        error.response.data.message ||
        `Error ${error.response.status}`;
      const log = `API Response Error: ${error.response.status} for ${error.config.url}, Message: ${errorMessage}`;
      console.error(log);
      const existingLogs = localStorage.getItem("apiLogs")
        ? JSON.parse(localStorage.getItem("apiLogs"))
        : [];
      existingLogs.push(log);
      localStorage.setItem("apiLogs", JSON.stringify(existingLogs));

      if (error.response.status === 401) {
        const requestUrl = error.config.url.replace("/api", "");
        const skipRedirectPatterns = [
          "/auth/validate-token",
          "/jobs/employer",
          "/notifications",
          /^\/applicant\/job\/[^\/]+$/,
          /^\/jobs\/\d+\/applicants$/,
        ];

        const shouldSkipRedirect = skipRedirectPatterns.some((pattern) =>
          typeof pattern === "string"
            ? pattern === requestUrl
            : pattern.test(requestUrl)
        );

        if (!shouldSkipRedirect) {
          if (!localStorage.getItem("refreshToken")) {
            localStorage.clear();
            window.location.href = "/login";
          }
        }
      }
      // Reject with a string message for the frontend to use directly
      return Promise.reject(errorMessage);
    }
    // If there's no response (e.g., network error), reject with a generic message
    const errorMessage = error.message || "An unexpected error occurred";
    console.error(`API Error (No Response): ${errorMessage}`);
    return Promise.reject(errorMessage);
  }
);

export default api;