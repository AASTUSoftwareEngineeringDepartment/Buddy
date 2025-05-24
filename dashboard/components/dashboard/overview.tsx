"use client";

import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

interface OverviewProps {
	scores?: number[];
}

export function Overview({scores}: OverviewProps) {
	let chartData;
	let isQuiz = false;
	if (scores && scores.length > 0) {
		isQuiz = true;
		chartData = scores.map((score, i) => ({
			name: `Quiz ${i + 1}`,
			total: score,
		}));
	} else {
		chartData = [
			{name: "Jan", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Feb", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Mar", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Apr", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "May", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Jun", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Jul", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Aug", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Sep", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Oct", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Nov", total: Math.floor(Math.random() * 5000) + 1000},
			{name: "Dec", total: Math.floor(Math.random() * 5000) + 1000},
		];
	}

	return (
		<ResponsiveContainer
			width='100%'
			height={350}
		>
			<LineChart data={chartData}>
				<XAxis
					dataKey='name'
					stroke='#888888'
					fontSize={12}
					tickLine={false}
					axisLine={false}
				/>
				<YAxis
					stroke='#888888'
					fontSize={12}
					tickLine={false}
					axisLine={false}
					tickFormatter={(value) => value}
				/>
				<Tooltip />
				<Line
					type='monotone'
					dataKey='total'
					stroke='#8884d8'
					strokeWidth={2}
					activeDot={{r: 8}}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
