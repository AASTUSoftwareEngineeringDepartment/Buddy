"use client";

import Link from "next/link";
import {useRouter, usePathname} from "next/navigation";
import {Home, Users, BookOpen, HelpCircle, Trophy, BarChart2, UserCog, UserPlus, LogOut, Heart} from "lucide-react";
import {cn} from "@/lib/utils";
import {useAuth} from "@/lib/context/auth-context";

const menuItems = [
	{label: "Dashboard Overview", icon: Home, href: "/dashboard"},
	{label: "My Children", icon: Users, href: "/dashboard/children"},
	{label: "Story Generator", icon: BookOpen, href: "/dashboard/story-generator"},
	{label: "Quizzes", icon: HelpCircle, href: "/dashboard/quizzes"},
	{label: "Achievements", icon: Trophy, href: "/dashboard/achievements"},
	{label: "Progress Reports", icon: BarChart2, href: "/dashboard/progress"},
	{label: "Manage Profile", icon: UserCog, href: "/dashboard/profile"},
	{label: "Add Child", icon: UserPlus, href: "/dashboard/add-child"},
];

export function Sidebar() {
	const pathname = usePathname();
	const {logout} = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	return (
		<aside className='fixed top-0 left-0 h-screen bg-white/90 backdrop-blur w-20 lg:w-64 flex flex-col py-4 px-2 lg:px-4 shadow-lg'>
			<div className='flex items-center justify-center lg:justify-start gap-2 mb-6'>
				<Heart className='w-6 h-6 text-rose-500' />
				<span className='text-xl font-bold text-[#344e41] tracking-tight'>Buddy</span>
			</div>
			<nav className='flex flex-col gap-0.5'>
				{menuItems.map(({label, icon: Icon, href}) => (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex items-center gap-4 rounded-xl px-3 py-2 text-base font-medium transition-all duration-200",
							"hover:bg-gray-100 hover:text-[#344e41] focus:bg-gray-100 focus:outline-none",
							pathname === href ? "bg-[#344e41] text-white shadow-sm" : "text-gray-700"
						)}
						aria-label={label}
					>
						<Icon
							className={cn("w-5 h-5 transition-colors", pathname === href ? "text-white" : "text-gray-600")}
							aria-hidden='true'
						/>
						<span className='hidden lg:inline text-base'>{label}</span>
					</Link>
				))}
				<button
					onClick={handleLogout}
					className={cn(
						"flex items-center gap-4 rounded-xl px-3 py-2 text-base font-medium transition-all duration-200",
						"mt-auto text-rose-600 hover:bg-rose-50 hover:text-rose-700"
					)}
					aria-label='Logout'
				>
					<LogOut
						className='w-5 h-5 text-rose-600'
						aria-hidden='true'
					/>
					<span className='hidden lg:inline text-base'>Logout</span>
				</button>
			</nav>
		</aside>
	);
}
