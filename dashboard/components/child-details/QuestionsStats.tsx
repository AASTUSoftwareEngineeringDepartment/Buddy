import React from "react";

export function QuestionsStats({questions}: {questions: {answered: number; notAnswered: number}}) {
	const total = questions.answered + questions.notAnswered;
	const percent = total > 0 ? Math.round((questions.answered / total) * 100) : 0;
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 border border-white/30'>
			<div className='text-lg font-bold text-[#344e41] mb-2'>Questions</div>
			<div className='flex items-center gap-4 mb-2'>
				<span className='text-green-700 font-semibold'>Answered: {questions.answered}</span>
				<span className='text-gray-400'>/</span>
				<span className='text-gray-500 font-semibold'>Not Answered: {questions.notAnswered}</span>
			</div>
			<div className='w-full bg-gray-200 rounded-full h-3'>
				<div
					className='bg-gradient-to-r from-[#344e41] to-[#a3b18a] h-3 rounded-full'
					style={{width: `${percent}%`}}
				/>
			</div>
			<div className='text-xs text-gray-500 mt-1'>{percent}% answered</div>
		</div>
	);
}
