import React from "react";
import {Zap, Settings, Pencil, Star} from "lucide-react";

export function ChildDetailsNavbar({
	child,
	onEdit,
	onSettings,
}: {
	child: {first_name: string; last_name: string; nickname?: string; xp?: number; level?: number};
	onEdit?: () => void;
	onSettings?: () => void;
}) {
	return (
		<div className='w-full rounded-2xl bg-gradient-to-r from-[#f5f7fa] via-[#e9f5ee] to-[#c9e7d6] shadow flex items-center px-6 py-4 mb-6 gap-4 border border-[#e0e4e8]'>
			{/* Avatar */}
			<div className='w-14 h-14 rounded-xl bg-[#e9f5ee] flex items-center justify-center mr-4 border border-[#dbead7]'>
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
			{/* XP & Level */}
			<div className='flex items-center gap-3'>
				<div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[#344e41] font-bold text-lg shadow border border-[#e0e4e8]'>
					<Zap className='w-5 h-5 text-yellow-500' /> XP: {child.xp ?? 0}
				</div>
				<div className='flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-[#344e41] font-bold text-lg shadow border border-[#e0e4e8]'>
					<Star className='w-5 h-5 text-yellow-500' /> Level: {child.level ?? 0}
				</div>
			</div>
			{/* Actions */}
			<div className='flex items-center gap-2 ml-4'>
				<button
					onClick={onEdit}
					className='p-2 rounded-full hover:bg-[#a3b18a]/20 transition border border-transparent hover:border-[#a3b18a]'
					title='Edit Child'
				>
					<Pencil className='w-5 h-5 text-[#344e41]' />
				</button>
				<button
					onClick={onSettings}
					className='p-2 rounded-full hover:bg-[#a3b18a]/20 transition border border-transparent hover:border-[#a3b18a]'
					title='Settings'
				>
					<Settings className='w-5 h-5 text-[#344e41]' />
				</button>
			</div>
		</div>
	);
}
