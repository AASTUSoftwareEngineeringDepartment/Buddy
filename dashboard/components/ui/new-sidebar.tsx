"use client";

import Link from "next/link";
import {useState, useEffect} from "react";
import {usePathname} from "next/navigation";
import {Users, Plus, ChevronDown, ChevronUp, LogOut} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {MAIN_SIDEBAR_MENUS, WORKSPACE_MENUS, SidebarMenuItem} from "@/lib/constants/sidebar-menus";
import {useAuth} from "@/lib/context/auth-context";

export function NewSidebar() {
	const pathname = usePathname();
	const {user} = useAuth();

	// Subtle subtitle cycling logic
	const subtitles = ["Fun Learning", "Safe & Secure", "Personalized Stories", "Parent Approved", "Award Winning"];
	const [subtitleIdx, setSubtitleIdx] = useState(0);
	const [fade, setFade] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setFade(false);
			setTimeout(() => {
				setSubtitleIdx((i) => (i + 1) % subtitles.length);
				setFade(true);
			}, 400); // fade out, then change
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<aside className='fixed top-0 left-0 h-screen w-72 bg-white border-r px-6 py-6 flex flex-col justify-between z-30'>
			{/* Top: Logo, Tagline, and Image */}
			<div>
				<div className='flex flex-col items-center gap-2 mb-4'>
					<span className='text-2xl font-bold text-[#344e41]'>GuadeKids.com</span>
					<span className='text-xs text-[#588157] text-center'>Empowering Kids to Learn & Grow</span>
				</div>
				<div className='mb-2 border-b border-gray-200 pb-1 text-xs text-gray-400 font-semibold uppercase tracking-wide'>Navigation</div>
				<nav className='flex flex-col gap-1 mb-8'>
					{MAIN_SIDEBAR_MENUS.map((item) => (
						<SidebarNavItem
							key={item.href}
							icon={item.icon}
							label={item.label}
							href={item.href}
							badge={item.badge}
							active={pathname === item.href}
						/>
					))}
				</nav>
				<div className='flex flex-col items-center mb-8'>
					<img
						src='/images/puppet.png'
						alt='Platform Quality'
						className='w-full h-60 object-cover animate-bounce-slow'
					/>
					<span
						className={`mt-2 text-xs text-[#344e41] font-medium transition-opacity duration-400 ${fade ? "opacity-100" : "opacity-0"}`}
						style={{minHeight: 20}}
					>
						{subtitles[subtitleIdx]}
					</span>
				</div>
			</div>
			{/* Bottom: Call-to-Action and User Profile */}
			<div>
				<button className='w-full mb-4 py-2 rounded-lg bg-[#e9f5ee] text-[#344e41] font-semibold hover:bg-[#a3b18a]/20 transition'>Need Help?</button>
				<div className='flex items-center gap-3 p-3 rounded-xl bg-gray-50'>
					<Avatar>
						<AvatarImage
							src='/avatars/user.png'
							alt='User Avatar'
						/>
						<AvatarFallback>ID</AvatarFallback>
					</Avatar>
					<div className='flex-1 min-w-0'>
						<div className='font-semibold text-sm truncate'>{user ? `${user.first_name} ${user.last_name}` : "Loading..."}</div>
						<div className='text-xs text-gray-500 truncate'>{user ? user.email : ""}</div>
					</div>
					<button className='p-1 rounded hover:bg-gray-100'>
						<LogOut className='w-5 h-5 text-gray-400' />
					</button>
				</div>
			</div>
		</aside>
	);
}

function SidebarNavItem({icon, label, href, badge, small, active}: SidebarMenuItem & {small?: boolean; active?: boolean}) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-3 px-2 py-2 rounded transition text-gray-700 hover:bg-gray-100 hover:text-[#344e41] ${
				small ? "text-sm pl-6" : "text-base font-medium"
			} ${active ? "border-l-4 border-[#344e41] bg-[#f2f5f4] text-[#344e41]" : ""}`}
		>
			{icon &&
				(() => {
					const Icon = icon;
					return <Icon className='w-5 h-5' />;
				})()}
			<span>{label}</span>
			{badge !== undefined && <span className='ml-auto bg-[#f2f5f4] text-[#344e41] text-xs font-semibold px-2 py-0.5 rounded-full'>{badge}</span>}
		</Link>
	);
}

/* global bounce animation for puppet image */
if (typeof window !== "undefined") {
	const style = document.createElement("style");
	style.innerHTML = `
		@keyframes bounce-slow {
			0%, 100% { transform: translateY(0); }
			20% { transform: translateY(-18px); }
			40% { transform: translateY(0); }
		}
		.animate-bounce-slow {
			animation: bounce-slow 1s infinite;
		}
	`;
	document.head.appendChild(style);
}
