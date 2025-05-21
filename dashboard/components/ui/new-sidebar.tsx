"use client";

import Link from "next/link";
import {useState} from "react";
import {usePathname} from "next/navigation";
import {Home, BarChart2, Calendar, Users, Settings, Plus, ChevronDown, ChevronUp, User as UserIcon, LogOut} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export function NewSidebar() {
	const [workspaceOpen, setWorkspaceOpen] = useState(true);
	const pathname = usePathname();

	return (
		<aside className='flex flex-col h-screen w-72 bg-white border-r px-6 py-6 justify-between'>
			{/* Top: Logo and Main Nav */}
			<div>
				{/* Logo */}
				<div className='flex items-center gap-2 mb-8'>
					<span className='text-2xl font-bold text-[#344e41]'>GuadeKids.com</span>
				</div>
				{/* Main Navigation */}
				<nav className='flex flex-col gap-1 mb-8'>
					<SidebarNavItem
						icon={<Home className='w-5 h-5' />}
						label='Dashboard'
						href='/dashboard'
						active={pathname === "/dashboard"}
					/>
					<SidebarNavItem
						icon={<BarChart2 className='w-5 h-5' />}
						label='Interviews'
						href='/dashboard/interviews'
						badge={4}
						active={pathname === "/dashboard/interviews"}
					/>
					<SidebarNavItem
						icon={<Calendar className='w-5 h-5' />}
						label='Calendar'
						href='/dashboard/calendar'
						active={pathname === "/dashboard/calendar"}
					/>
					<SidebarNavItem
						icon={<Users className='w-5 h-5' />}
						label='Candidates'
						href='/dashboard/candidates'
						active={pathname === "/dashboard/candidates"}
					/>
					<SidebarNavItem
						icon={<Settings className='w-5 h-5' />}
						label='Settings'
						href='/dashboard/settings'
						active={pathname === "/dashboard/settings"}
					/>
				</nav>
				{/* Workspaces Section */}
				<div className='mb-2 flex items-center justify-between text-xs text-gray-500 font-semibold uppercase tracking-wide'>
					<span>Workspaces</span>
					<button className='p-1 rounded hover:bg-gray-100'>
						<Plus className='w-4 h-4' />
					</button>
				</div>
				{/* Collapsible Workspace Group */}
				<div>
					<button
						className='flex items-center gap-2 w-full text-sm font-semibold py-2 px-2 rounded hover:bg-gray-100 transition'
						onClick={() => setWorkspaceOpen((v) => !v)}
					>
						<Users className='w-4 h-4 text-gray-500' />
						<span>Design Department</span>
						{workspaceOpen ? <ChevronUp className='w-4 h-4 ml-auto' /> : <ChevronDown className='w-4 h-4 ml-auto' />}
					</button>
					{workspaceOpen && (
						<div className='pl-7 flex flex-col gap-1 mt-1'>
							<SidebarNavItem
								label='UI Design'
								href='/dashboard/ui-design'
								badge={2}
								small
								active={pathname === "/dashboard/ui-design"}
							/>
							<SidebarNavItem
								label='UX Design'
								href='/dashboard/ux-design'
								small
								active={pathname === "/dashboard/ux-design"}
							/>
							<SidebarNavItem
								label='Brand Design'
								href='/dashboard/brand-design'
								small
								active={pathname === "/dashboard/brand-design"}
							/>
							<SidebarNavItem
								label='Marketing Design'
								href='/dashboard/marketing-design'
								small
								active={pathname === "/dashboard/marketing-design"}
							/>
						</div>
					)}
				</div>
			</div>
			{/* Bottom: User Profile */}
			<div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 mt-8'>
				<Avatar>
					<AvatarImage
						src='/avatars/user.png'
						alt='User Avatar'
					/>
					<AvatarFallback>ID</AvatarFallback>
				</Avatar>
				<div className='flex-1 min-w-0'>
					<div className='font-semibold text-sm truncate'>Icon Designer</div>
					<div className='text-xs text-gray-500 truncate'>iconsha@gmail.com</div>
				</div>
				<button className='p-1 rounded hover:bg-gray-100'>
					<LogOut className='w-5 h-5 text-gray-400' />
				</button>
			</div>
		</aside>
	);
}

function SidebarNavItem({
	icon,
	label,
	href,
	badge,
	small,
	active,
}: {
	icon?: React.ReactNode;
	label: string;
	href: string;
	badge?: number;
	small?: boolean;
	active?: boolean;
}) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-3 px-2 py-2 rounded transition text-gray-700 hover:bg-gray-100 hover:text-[#344e41] ${
				small ? "text-sm pl-6" : "text-base font-medium"
			} ${active ? "border-l-4 border-[#344e41] bg-[#f2f5f4] text-[#344e41]" : ""}`}
		>
			{icon && <span>{icon}</span>}
			<span>{label}</span>
			{badge !== undefined && <span className='ml-auto bg-[#f2f5f4] text-[#344e41] text-xs font-semibold px-2 py-0.5 rounded-full'>{badge}</span>}
		</Link>
	);
}
