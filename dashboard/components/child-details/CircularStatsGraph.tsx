import React from "react";
import {CircularProgressbarWithChildren, buildStyles} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface CircularStatsGraphProps {
	solved: number;
	total: number;
	attempting: number;
	easy: {solved: number; total: number};
	medium: {solved: number; total: number};
	hard: {solved: number; total: number};
}

export function CircularStatsGraph({solved, total, attempting, easy, medium, hard}: CircularStatsGraphProps) {
	const percent = (solved / total) * 100;
	return (
		<div className='rounded-2xl bg-white/60 backdrop-blur-md shadow-lg border border-white/40 p-6 w-full max-w-md mx-auto flex flex-col gap-4'>
			<div className='flex flex-col items-center gap-1 mb-2'>
				<span className='text-lg font-bold text-[#344e41] tracking-tight'>Progress Overview</span>
				<span className='text-sm text-[#588157] font-medium'>{attempting} Attempting</span>
			</div>
			<div className='flex flex-row items-center justify-center gap-6'>
				<div className='w-32 h-32 flex items-center justify-center'>
					<div className='relative w-32 h-32'>
						<CircularProgressbarWithChildren
							value={percent}
							strokeWidth={10}
							styles={buildStyles({
								pathColor: `url(#buddy-gradient)`,
								trailColor: "#e0e4e8",
								backgroundColor: "transparent",
							})}
						>
							<svg style={{height: 0}}>
								<defs>
									<linearGradient
										id='buddy-gradient'
										x1='1'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='0%'
											stopColor='#344e41'
										/>
										<stop
											offset='50%'
											stopColor='#588157'
										/>
										<stop
											offset='100%'
											stopColor='#a3b18a'
										/>
									</linearGradient>
								</defs>
							</svg>
							<div className='flex flex-col items-center justify-center mt-2'>
								<span className='text-2xl font-extrabold text-[#344e41]'>{solved}</span>
								<span className='text-base text-[#588157] font-semibold'>/ {total}</span>
								<span className='text-green-700 font-medium mt-1 text-xs'>✔ Solved</span>
							</div>
						</CircularProgressbarWithChildren>
					</div>
				</div>
				<div className='flex flex-col gap-3 min-w-[110px]'>
					<div className='rounded-xl bg-[#e9f5ee] border border-[#a3b18a]/30 px-4 py-2 flex flex-col items-end shadow-sm'>
						<span className='text-[#344e41] font-bold text-sm'>Easy</span>
						<span className='text-[#344e41] text-xs font-semibold'>
							{easy.solved}/{easy.total}
						</span>
					</div>
					<div className='rounded-xl bg-[#fdf6e3] border border-[#ffd600]/30 px-4 py-2 flex flex-col items-end shadow-sm'>
						<span className='text-[#b68900] font-bold text-sm'>Med.</span>
						<span className='text-[#b68900] text-xs font-semibold'>
							{medium.solved}/{medium.total}
						</span>
					</div>
					<div className='rounded-xl bg-[#fbeaea] border border-[#ff595e]/30 px-4 py-2 flex flex-col items-end shadow-sm'>
						<span className='text-[#b94a48] font-bold text-sm'>Hard</span>
						<span className='text-[#b94a48] text-xs font-semibold'>
							{hard.solved}/{hard.total}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
