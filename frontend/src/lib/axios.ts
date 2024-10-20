import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // Include credentials (cookies) in requests
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// axiosInstance.interceptors.request.use(function (config) {});

let refreshingTokenInProgress = false;

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.config?.url?.includes("refresh-token")) {
      return Promise.reject(error);
    }

    if (
      error?.response?.status === 401 &&
      !error?.config?.url?.includes("login") &&
      !refreshingTokenInProgress
    ) {
      refreshingTokenInProgress = true;

      const response = await axiosInstance.post("/auth/refresh-token");
      console.log("in axios");

      if (response.status === 200) {
        const data = response.data;

        localStorage.setItem("accessToken", data.accessToken);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (window.location.href !== "/login") window.location.href = "/login";
      }
      return axios(error.config);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
