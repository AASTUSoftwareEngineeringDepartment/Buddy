import axios, {InternalAxiosRequestConfig, AxiosResponse} from "axios";
import Cookies from "js-cookie";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Get token from cookies
		const token = Cookies.get("token");

		// If token exists, add it to headers with Bearer scheme
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};

		// Handle 401 Unauthorized errors
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Clear stored data and redirect to login
			Cookies.remove("token");
			localStorage.removeItem("user_id");
			localStorage.removeItem("role");
			window.location.href = "/login";
			return Promise.reject(error);
		}

		return Promise.reject(error);
	}
);

export default api;
