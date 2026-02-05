import axios from "axios";

// Create an instance of axios with the base URL of your Django API
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

/**
 * 1. Request Interceptor
 * This runs before every request sent to the server.
 * It automatically attaches the JWT Access Token to the headers.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

   if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
/**
 * 2. Response Interceptor
 * This handles the response coming back from the server.
 * If the server returns a 401 (Unauthorized), it tries to refresh the token.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to get a new Access Token using the Refresh Token
          // Note: Using standard axios here to avoid infinite loops with the interceptor
          const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
            refresh: refreshToken,
          });

          // If successful, save the new access token
          const newAccessToken = res.data.access;
          localStorage.setItem("access_token", newAccessToken);

          // Update the header of the original request and retry it
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If the refresh token itself is expired or invalid, log out the user
          console.error("Refresh token failed, logging out...");
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    // Return the error if it's not a 401 or refresh also fails
    return Promise.reject(error);
  }
);

export default api;