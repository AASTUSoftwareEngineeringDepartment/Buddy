import React from "react";
import {Zap, Settings, Pencil} from "lucide-react";

export function ChildDetailsNavbar({
	child,
	onEdit,
	onSettings,
}: {
	child: {first_name: string; last_name: string; nickname?: string; xp?: number};
	onEdit?: () => void;
	onSettings?: () => void;
}) {
	return (
		<div className='w-full rounded-2xl bg-gradient-to-r from-[#a3b18a]/60 via-[#e9f5ee]/80 to-[#588157]/60 backdrop-blur-md shadow flex items-center px-6 py-4 mb-6 gap-4'>
			{/* Avatar */}
			<div className='w-14 h-14 rounded-xl bg-[#344e41]/10 flex items-center justify-center mr-4'>
				<span className='text-[#344e41] text-2xl font-bold'>
					{child.first_name[0]}
					{child.last_name[0]}
				</span>
			</div>
			{/* Name & Nickname */}
			<div className='flex flex-col flex-1 min-w-0'>
				<span className='font-bold text-xl text-[#344e41] truncate'>
					{child.first_name} {child.last_name}
				</span>
				{child.nickname && <span className='text-sm text-[#588157] font-medium truncate'>{child.nickname}</span>}
			</div>
			{/* XP */}
			<div className='flex items-center gap-2 bg-white/60 px-4 py-2 rounded-xl text-[#344e41] font-bold text-lg shadow'>
				<Zap className='w-5 h-5 text-yellow-500' /> XP: {child.xp ?? 0}
			</div>
			{/* Actions */}
			<div className='flex items-center gap-2 ml-4'>
				<button
					onClick={onEdit}
					className='p-2 rounded-full hover:bg-[#a3b18a]/30 transition'
					title='Edit Child'
				>
					<Pencil className='w-5 h-5 text-[#344e41]' />
				</button>
				<button
					onClick={onSettings}
					className='p-2 rounded-full hover:bg-[#a3b18a]/30 transition'
					title='Settings'
				>
					<Settings className='w-5 h-5 text-[#344e41]' />
				</button>
			</div>
		</div>
	);
}
