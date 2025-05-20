// axiosInstance.ts (create a custom axios instance)
import axios from "axios";
const proxyURL = import.meta.env.VITE_PROXY_URL;
const axiosInstance = axios.create({
  baseURL: proxyURL, // update with actual backend URL
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
