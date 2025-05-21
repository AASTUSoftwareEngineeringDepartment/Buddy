import api from "../axios";
import Cookies from "js-cookie";

interface LoginCredentials {
	username: string;
	password: string;
}

interface SignUpData {
	username: string;
	password: string;
	fullName: string;
}

interface AuthResponse {
	access_token: string;
	token_type: string;
	role: string;
	user_id: string;
}

export const authApi = {
	login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/api/v1/auth/login", credentials);
		// Token is set in the login page
		return response.data;
	},

	signup: async (data: SignUpData): Promise<AuthResponse> => {
		const response = await api.post<AuthResponse>("/api/v1/auth/register", data);
		// Store the access token and role in cookies (7 days expiry)
		Cookies.set("token", response.data.access_token, {expires: 7});
		Cookies.set("role", response.data.role, {expires: 7});
		return response.data;
	},

	refreshToken: async (refreshToken: string): Promise<{token: string}> => {
		const response = await api.post<{token: string}>("/api/v1/auth/refresh", {refreshToken});
		return response.data;
	},

	logout: async (): Promise<void> => {
		try {
			// First clear all cookies and storage
			Cookies.remove("token");
			Cookies.remove("role");
			localStorage.removeItem("user_id");

			// Then notify the server (even if this fails, the user will be logged out locally)
			await api.post("/api/v1/auth/logout");
		} catch (error) {
			// Even if the server request fails, we want to ensure local cleanup
			Cookies.remove("token");
			Cookies.remove("role");
			localStorage.removeItem("user_id");
			throw error; // Re-throw to handle in the UI
		}
	},
};
