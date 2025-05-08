"use client";

export default function DashboardLayout({children}: {children: React.ReactNode}) {
	return (
		<div className='flex-1'>
			<main className='overflow-y-auto p-8'>{children}</main>
		</div>
	);
}
