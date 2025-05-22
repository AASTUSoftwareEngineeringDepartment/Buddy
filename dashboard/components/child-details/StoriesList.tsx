import React from "react";
import {BookMarked} from "lucide-react";

const gradients = [
	"from-[#a3b18a] to-[#588157]",
	"from-[#588157] to-[#344e41]",
	"from-[#e9f5ee] to-[#a3b18a]",
	"from-[#b5ead7] to-[#344e41]",
	"from-[#f9f871] to-[#a3b18a]",
	"from-[#f7b267] to-[#588157]",
];

export function StoriesList({stories}: {stories: {title: string; date: string}[]}) {
	return (
		<div>
			<div className='text-lg font-bold text-[#344e41] mb-3 flex items-center gap-2'>
				<BookMarked className='w-5 h-5 text-[#344e41]' /> Stories
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{stories.length === 0 ? (
					<div className='text-gray-400 italic col-span-full'>No stories yet.</div>
				) : (
					stories.map((story, idx) => (
						<div
							key={idx}
							className={`rounded-2xl p-5 flex flex-col justify-between min-h-[90px] transition hover:scale-[1.03] cursor-pointer bg-gradient-to-tr ${
								gradients[idx % gradients.length]
							}`}
						>
							<div className='flex items-center gap-2 mb-2'>
								<BookMarked className='w-4 h-4 text-white/80' />
								<span className='font-bold text-white text-lg truncate'>{story.title}</span>
							</div>
							<span className='text-xs text-white/80 mt-auto'>{story.date}</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}
