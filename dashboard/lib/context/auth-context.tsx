"use client";

import {createContext, useContext, useEffect, useState, ReactNode} from "react";
import {useRouter} from "next/navigation";
import Cookies from "js-cookie";
import {authApi, User} from "@/lib/api/auth";
import {toast} from "sonner";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchUser = async () => {
			const token = Cookies.get("token");
			if (!token) {
				setIsLoading(false);
				return;
			}
			try {
				const userData = await authApi.getCurrentUser();
				setUser(userData);
			} catch (error) {
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUser();
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await authApi.login({username, password});

			// Check if user role is parent
			if (response.role !== "parent") {
				toast.error("Unauthorized Access", {
					description: "This dashboard is only accessible to parents",
					duration: 5000,
				});
				return;
			}

			// Store token and role in cookies (7 days expiry)
			Cookies.set("token", response.access_token, {expires: 7});
			Cookies.set("role", response.role, {expires: 7});

			// Fetch and set full user info
			const userData = await authApi.getCurrentUser();
			setUser(userData);

			// Show success toast
			toast.success("Login Successful", {
				description: "Welcome back to your dashboard",
			});

			router.push("/dashboard");
		} catch (error: any) {
			console.error("Login error:", error);
			toast.error(error.response?.data?.message || "Invalid username or password", {
				description: "Please check your credentials and try again",
				duration: 5000,
			});
			throw error;
		}
	};

	const logout = async () => {
		try {
			await authApi.logout();
			setUser(null);
			toast.success("Logged out successfully");
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to logout", {
				description: "Please try again",
			});
			throw error;
		}
	};

	return <AuthContext.Provider value={{user, isLoading, login, logout}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
