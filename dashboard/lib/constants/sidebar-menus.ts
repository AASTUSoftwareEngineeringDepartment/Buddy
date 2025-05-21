import type {ComponentType} from "react";
import {Home, LayoutDashboard, Users, Settings} from "lucide-react";

export interface SidebarMenuItem {
	icon?: ComponentType<{className?: string}>;
	label: string;
	href: string;
	badge?: number;
}

export const MAIN_SIDEBAR_MENUS: SidebarMenuItem[] = [
	{
		icon: Home,
		label: "Home",
		href: "/",
	},
	{
		icon: LayoutDashboard,
		label: "Dashboard",
		href: "/dashboard",
	},
	{
		icon: Users,
		label: "Children",
		href: "/dashboard/children",
	},
	{
		icon: Settings,
		label: "Settings",
		href: "/dashboard/settings",
	},
];

export const WORKSPACE_MENUS: SidebarMenuItem[] = [
	{label: "UI Design", href: "/dashboard/ui-design", badge: 2},
	{label: "UX Design", href: "/dashboard/ux-design"},
	{label: "Brand Design", href: "/dashboard/brand-design"},
	{label: "Marketing Design", href: "/dashboard/marketing-design"},
];
