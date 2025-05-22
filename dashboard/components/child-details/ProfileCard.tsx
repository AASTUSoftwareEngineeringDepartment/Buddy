import React from "react";
import {User, Zap, Flame} from "lucide-react";

export function ProfileCard({child}: {child: any}) {
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 flex flex-col items-center gap-3 border border-white/30'>
			<div className='w-20 h-20 rounded-full bg-[#344e41]/10 flex items-center justify-center mb-2'>
				<span className='text-[#344e41] text-3xl font-bold'>
					{child.first_name[0]}
					{child.last_name[0]}
				</span>
			</div>
			<div className='font-bold text-2xl text-[#344e41]'>
				{child.first_name} {child.last_name}
			</div>
			<div className='text-md text-gray-500'>{child.nickname}</div>
			<div className='flex items-center gap-2 mt-2'>
				<span
					className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
						child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
					}`}
				>
					{child.status}
				</span>
			</div>
			<div className='flex items-center gap-4 mt-4'>
				<div className='flex items-center gap-1 bg-[#e9f5ee] px-3 py-1 rounded-full text-[#344e41] font-semibold'>
					<Zap className='w-4 h-4 text-yellow-500' /> XP: {child.xp ?? 0}
				</div>
				<div className='flex items-center gap-1 bg-[#e9f5ee] px-3 py-1 rounded-full text-[#344e41] font-semibold'>
					<Flame className='w-4 h-4 text-orange-500' /> Streak: {child.streak ?? 0}
				</div>
			</div>
		</div>
	);
}
