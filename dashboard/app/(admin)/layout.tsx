"use client";

import {Sidebar} from "@/components/ui/sidebar";
import {Navbar} from "@/components/ui/navbar";

export default function AdminLayout({children}: {children: React.ReactNode}) {
	return (
		<div className='flex min-h-screen bg-background'>
			<Sidebar />
			<div className='flex-1 flex flex-col min-h-screen ml-20 lg:ml-64'>
				<Navbar />
				<main className='flex-1 p-6 lg:px-8'>{children}</main>
			</div>
		</div>
	);
}
