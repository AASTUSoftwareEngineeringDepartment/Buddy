import React from "react";
import {Zap, Flame} from "lucide-react";

export function RewardsCard({rewards}: {rewards: {xp: number; streak: number}}) {
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 flex flex-col items-center gap-4 border border-white/30'>
			<div className='text-lg font-bold text-[#344e41] mb-2'>Rewards</div>
			<div className='flex flex-col items-center gap-3 w-full'>
				<div className='flex items-center gap-2 bg-[#e9f5ee] px-6 py-3 rounded-2xl text-[#344e41] font-bold text-xl w-full justify-center'>
					<Zap className='w-6 h-6 text-yellow-500' /> XP: {rewards.xp}
				</div>
				<div className='flex items-center gap-2 bg-[#e9f5ee] px-6 py-3 rounded-2xl text-[#344e41] font-bold text-xl w-full justify-center'>
					<Flame className='w-6 h-6 text-orange-500' /> Streak: {rewards.streak} days
				</div>
			</div>
		</div>
	);
}
