import React from "react";

export function VocabularyList({vocabulary}: {vocabulary: string[] | number[]}) {
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 flex flex-col gap-4 border border-white/30'>
			<div className='text-lg font-bold text-[#344e41] mb-2'>Vocabulary</div>
			<div className='grid grid-cols-2 gap-2'>
				{vocabulary.length === 0 ? (
					<span className='text-gray-400 italic'>No vocabulary yet.</span>
				) : (
					vocabulary.map((word, idx) => (
						<span
							key={idx}
							className='px-3 py-1 rounded-full bg-[#e9f5ee] text-[#344e41] text-sm font-medium shadow'
						>
							{word}
						</span>
					))
				)}
			</div>
		</div>
	);
}
