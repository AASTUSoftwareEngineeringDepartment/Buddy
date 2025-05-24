"use client";

import {NewSidebar} from "@/components/ui/new-sidebar";

export default function AdminLayout({children}: {children: React.ReactNode}) {
	return (
		<div className='flex min-h-screen bg-background'>
			<NewSidebar />
			<div className='ml-72 flex-1 flex flex-col min-h-screen h-full'>
				<main className='flex-1 p-6 lg:px-8 overflow-y-auto'>{children}</main>
			</div>
		</div>
	);
}
