"use client";

import {NewSidebar} from "@/components/ui/new-sidebar";

export default function AdminLayout({children}: {children: React.ReactNode}) {
	return (
		<div className='flex min-h-screen bg-background'>
			<NewSidebar />
			<div className='flex-1 flex flex-col min-h-screen ml-0'>
				<main className='flex-1 p-6 lg:px-8'>{children}</main>
			</div>
		</div>
	);
}
