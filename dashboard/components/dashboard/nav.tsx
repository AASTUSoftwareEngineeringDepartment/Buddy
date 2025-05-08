"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Menu} from "lucide-react";

const sidebarNavItems = [
	{
		title: "Overview",
		href: "/dashboard",
	},
	{
		title: "Analytics",
		href: "/dashboard/analytics",
	},
	{
		title: "Reports",
		href: "/dashboard/reports",
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
	},
];

export function DashboardNav() {
	const pathname = usePathname();

	return (
		<>
			{/* Mobile Navigation */}
			<Sheet>
				<SheetTrigger asChild>
					<Button
						variant='ghost'
						className='mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden'
					>
						<Menu className='h-6 w-6' />
						<span className='sr-only'>Toggle Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side='left'
					className='pl-1 pr-0'
				>
					<div className='px-7 py-6'>
						<h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Dashboard</h2>
						<ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-10'>
							<div className='flex flex-col space-y-3'>
								{sidebarNavItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
											pathname === item.href ? "bg-accent" : "transparent"
										)}
									>
										{item.title}
									</Link>
								))}
							</div>
						</ScrollArea>
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Navigation */}
			<div className='hidden border-r bg-background lg:block lg:w-72'>
				<div className='flex h-full flex-col'>
					<div className='px-7 py-6'>
						<h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>Dashboard</h2>
						<ScrollArea className='my-4 h-[calc(100vh-8rem)] pb-10'>
							<div className='flex flex-col space-y-3'>
								{sidebarNavItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
											pathname === item.href ? "bg-accent" : "transparent"
										)}
									>
										{item.title}
									</Link>
								))}
							</div>
						</ScrollArea>
					</div>
				</div>
			</div>
		</>
	);
}
