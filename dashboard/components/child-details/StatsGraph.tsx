import React from "react";
import {AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend} from "recharts";

export function StatsGraph({stats}: {stats: {vocabulary: number[]; quizScores: number[]}}) {
	// Mock months for x-axis
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const data = months.map((month, i) => ({
		month,
		vocabulary: stats.vocabulary[i] ?? null,
		quiz: stats.quizScores[i] ?? null,
	}));
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 border border-white/30'>
			<div className='text-lg font-bold text-[#344e41] mb-4'>Progress Overview</div>
			<ResponsiveContainer
				width='100%'
				height={220}
			>
				<AreaChart
					data={data}
					margin={{left: 0, right: 0, top: 10, bottom: 0}}
				>
					<defs>
						<linearGradient
							id='colorVocab'
							x1='0'
							y1='0'
							x2='0'
							y2='1'
						>
							<stop
								offset='5%'
								stopColor='#344e41'
								stopOpacity={0.8}
							/>
							<stop
								offset='95%'
								stopColor='#344e41'
								stopOpacity={0.1}
							/>
						</linearGradient>
						<linearGradient
							id='colorQuiz'
							x1='0'
							y1='0'
							x2='0'
							y2='1'
						>
							<stop
								offset='5%'
								stopColor='#588157'
								stopOpacity={0.8}
							/>
							<stop
								offset='95%'
								stopColor='#588157'
								stopOpacity={0.1}
							/>
						</linearGradient>
					</defs>
					<XAxis
						dataKey='month'
						tick={{fill: "#344e41", fontSize: 12}}
					/>
					<YAxis tick={{fill: "#344e41", fontSize: 12}} />
					<Tooltip />
					<Legend />
					<Area
						type='monotone'
						dataKey='vocabulary'
						stroke='#344e41'
						fillOpacity={1}
						fill='url(#colorVocab)'
						name='Vocabulary'
					/>
					<Area
						type='monotone'
						dataKey='quiz'
						stroke='#588157'
						fillOpacity={1}
						fill='url(#colorQuiz)'
						name='Quiz Score'
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
