import React, {useState} from "react";

interface Question {
	question_id: string;
	chunk_id: string;
	question: string;
	options: string[];
	correct_option_index: number;
	difficulty_level: string;
	age_range: string;
	topic: string;
	created_at: string;
	child_id: string;
	solved: boolean;
	selected_answer: number | null;
	scored: boolean;
	answered_at?: string;
	attempts: number;
}

export function QuestionsAccordion({questions}: {questions: Question[]}) {
	const [open, setOpen] = useState<string | null>(null);
	return (
		<div className='rounded-2xl bg-white/60 backdrop-blur-md shadow border border-[#e0e4e8] p-6 w-full flex flex-col gap-4'>
			<div className='text-lg font-bold text-[#344e41] mb-2'>Recent Questions</div>
			{questions.length === 0 && <div className='text-gray-400 italic text-center'>No questions found.</div>}
			{questions.map((q, idx) => {
				const isOpen = open === q.question_id;
				return (
					<div
						key={q.question_id}
						className={`rounded-xl border border-[#e0e4e8] bg-white/80 shadow-sm mb-2 transition-all ${
							isOpen ? "ring-2 ring-[#a3b18a]" : "hover:shadow-md"
						}`}
					>
						<button
							className='w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none'
							onClick={() => setOpen(isOpen ? null : q.question_id)}
						>
							<div className='flex flex-col gap-1 flex-1'>
								<span className='font-semibold text-[#344e41] text-base'>
									Q{idx + 1}. {q.question}
								</span>
								<div className='flex gap-2 text-xs text-gray-500 mt-1'>
									<span className='bg-[#e9f5ee] text-[#344e41] rounded px-2 py-0.5'>{q.difficulty_level}</span>
									<span className='bg-[#fdf6e3] text-[#b68900] rounded px-2 py-0.5'>{q.topic}</span>
									<span className='bg-[#fbeaea] text-[#b94a48] rounded px-2 py-0.5'>{q.age_range}</span>
									<span>{new Date(q.created_at).toLocaleDateString()}</span>
									<span>Attempts: {q.attempts}</span>
								</div>
							</div>
							<span className={`ml-4 text-xl transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`}>▶</span>
						</button>
						{isOpen && (
							<div className='px-6 pb-4 pt-2 flex flex-col gap-2 animate-fade-in'>
								<div className='flex flex-col gap-2'>
									{q.options.map((opt, i) => {
										const isCorrect = i === q.correct_option_index;
										const isSelected = q.selected_answer === i;
										return (
											<div
												key={i}
												className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                          ${isCorrect ? "border-green-400 bg-green-50" : "border-[#e0e4e8] bg-white/70"}
                          ${isSelected ? (isCorrect ? "ring-2 ring-green-400" : "ring-2 ring-yellow-400") : ""}
                        `}
											>
												<span
													className={`w-6 h-6 flex items-center justify-center rounded-full font-bold
                          ${isCorrect ? "bg-green-400 text-white" : "bg-gray-200 text-gray-600"}
                        `}
												>
													{String.fromCharCode(65 + i)}
												</span>
												<span className='flex-1 text-sm text-[#344e41]'>{opt}</span>
												{isCorrect && <span className='text-xs text-green-600 font-semibold ml-2'>Correct</span>}
												{isSelected && !isCorrect && <span className='text-xs text-yellow-600 font-semibold ml-2'>Selected</span>}
												{isSelected && isCorrect && <span className='text-xs text-green-700 font-semibold ml-2'>Your Answer</span>}
											</div>
										);
									})}
								</div>
								<div className='flex gap-4 mt-2 text-xs text-gray-500'>
									<span>
										Status:{" "}
										{q.solved ? (
											<span className='text-green-600 font-semibold'>Solved</span>
										) : (
											<span className='text-red-500 font-semibold'>Unsolved</span>
										)}
									</span>
									{q.answered_at && <span>Answered: {new Date(q.answered_at).toLocaleString()}</span>}
									<span>Scored: {q.scored ? "Yes" : "No"}</span>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
