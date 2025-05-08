"use client";

import {Bell} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";

export function Navbar() {
	return (
		<header className='flex items-center justify-end px-4 py-3 sticky top-0 z-30'>
			<div className='flex items-center gap-4'>
				<Button
					variant='ghost'
					className='relative rounded-full p-2 hover:bg-gray-100/50 focus:bg-gray-100/50'
					aria-label='Notifications'
				>
					<Bell className='w-5 h-5 text-gray-600' />
					<span className='absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5'>3</span>
				</Button>
				<div className='flex items-center gap-2'>
					<Avatar>
						<AvatarImage
							src='/avatars/parent.png'
							alt='Parent Avatar'
						/>
						<AvatarFallback>AL</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}
