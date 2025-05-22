import React from "react";
import {Trophy} from "lucide-react";

export function AchievementsList({achievements}: {achievements: {icon?: React.ReactNode; title: string; description: string}[]}) {
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 border border-white/30'>
			<div className='text-lg font-bold text-[#344e41] mb-2 flex items-center gap-2'>
				<Trophy className='w-5 h-5 text-[#344e41]' /> Achievements
			</div>
			<ul className='space-y-2'>
				{achievements.length === 0 ? (
					<li className='text-gray-400 italic'>No achievements yet.</li>
				) : (
					achievements.map((ach, idx) => (
						<li
							key={idx}
							className='flex items-center gap-3 bg-[#e9f5ee] rounded-xl px-3 py-2'
						>
							<span className='text-2xl'>{ach.icon ?? <Trophy className='w-5 h-5 text-[#344e41]' />}</span>
							<span className='font-medium text-[#344e41]'>{ach.title}</span>
							<span className='ml-auto text-xs text-gray-500'>{ach.description}</span>
						</li>
					))
				)}
			</ul>
		</div>
	);
}
