import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    };

    if (error.response?.status !== 401) {
      console.error('API Error:', errorResponse);
    }

    if (error.response?.status === 401) {
      const isAuthPage = ['/login', '/signup'].some(path => 
        window.location.pathname.includes(path)
      );
      
      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      ...errorResponse,
      isAxiosError: true,
    });
  }
);

export default api;