import React, {useMemo, useState} from "react";
import {format, subDays, differenceInDays} from "date-fns";

// Helper to generate the last 26 weeks (half a year)
function getYearGrid() {
	const endDate = new Date();
	const startDate = subDays(endDate, 179); // 26 weeks * 7 days - 1
	const days = [];
	for (let d = 0; d <= differenceInDays(endDate, startDate); d++) {
		days.push(subDays(endDate, differenceInDays(endDate, startDate) - d));
	}
	// Group by week (columns)
	const weeks = [];
	let week = [];
	days.forEach((day, idx) => {
		if (week.length === 0) {
			for (let i = 0; i < day.getDay(); i++) week.push(null);
		}
		week.push(day);
		if (week.length === 7) {
			weeks.push(week);
			week = [];
		}
	});
	if (week.length > 0) {
		while (week.length < 7) week.push(null);
		weeks.push(week);
	}
	return weeks;
}

function getColor(count: number) {
	if (count === 0) return "bg-gray-200";
	if (count < 2) return "bg-green-100";
	if (count < 4) return "bg-green-400";
	if (count < 7) return "bg-green-600";
	return "bg-green-900";
}

function getColorLabel(count: number) {
	if (count === 0) return "No activity";
	if (count < 2) return "Low";
	if (count < 4) return "Medium";
	if (count < 7) return "High";
	return "Very High";
}

export function StreakHeatmap({activityData}: {activityData: {date: string; count: number}[]}) {
	const [tooltip, setTooltip] = useState<{x: number; y: number; date: string; count: number} | null>(null);
	// Map date string to count
	const activityMap = useMemo(() => {
		const map = new Map<string, number>();
		activityData.forEach(({date, count}) => {
			map.set(format(new Date(date), "yyyy-MM-dd"), count);
		});
		return map;
	}, [activityData]);

	const weeks = getYearGrid();
	// Calculate total active days and current streak
	const activeDays = activityData.filter((d) => d.count > 0).length;
	let currentStreak = 0,
		maxStreak = 0,
		streak = 0;
	for (let i = activityData.length - 1; i >= 0; i--) {
		if (activityData[i].count > 0) {
			streak++;
			if (i === 0) currentStreak = streak;
		} else {
			if (i === activityData.length - 1) currentStreak = streak;
			streak = 0;
		}
		if (streak > maxStreak) maxStreak = streak;
	}

	return (
		<div className='w-full rounded-2xl bg-white/60 backdrop-blur-md shadow border border-[#e0e4e8] p-6 flex flex-col gap-4'>
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2'>
				<div>
					<div className='text-lg font-bold text-[#344e41] mb-1'>Activity Heatmap</div>
					<div className='text-xs text-[#588157] font-medium'>Last 6 months</div>
				</div>
				<div className='flex items-center gap-2 mt-2 md:mt-0'>
					<span className='text-xs text-gray-500'>Legend:</span>
					<span
						className='w-4 h-4 rounded bg-gray-200 border border-gray-300'
						title='No activity'
					/>
					<span
						className='w-4 h-4 rounded bg-green-100 border border-green-200'
						title='Low'
					/>
					<span
						className='w-4 h-4 rounded bg-green-400 border border-green-300'
						title='Medium'
					/>
					<span
						className='w-4 h-4 rounded bg-green-600 border border-green-500'
						title='High'
					/>
					<span
						className='w-4 h-4 rounded bg-green-900 border border-green-800'
						title='Very High'
					/>
				</div>
			</div>
			<div className='overflow-x-auto w-full flex justify-center'>
				<div className='flex gap-[2px]'>
					{weeks.map((week, wIdx) => (
						<div
							key={wIdx}
							className='flex flex-col gap-[2px]'
						>
							{week.map((day, dIdx) => {
								if (!day)
									return (
										<div
											key={dIdx}
											className='w-4 h-4 rounded bg-transparent'
										/>
									);
								const dateStr = format(day, "yyyy-MM-dd");
								const count = activityMap.get(dateStr) || 0;
								return (
									<div
										key={dIdx}
										className={`w-4 h-4 rounded ${getColor(
											count
										)} border border-white/40 cursor-pointer transition duration-150 hover:scale-110 relative`}
										title={`${dateStr}: ${count} activity`}
										onMouseEnter={(e) => {
											const rect = (e.target as HTMLElement).getBoundingClientRect();
											setTooltip({
												x: rect.left + rect.width / 2,
												y: rect.top,
												date: dateStr,
												count,
											});
										}}
										onMouseLeave={() => setTooltip(null)}
									/>
								);
							})}
						</div>
					))}
				</div>
				{tooltip && (
					<div
						className='fixed z-50 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200 text-xs text-[#344e41] pointer-events-none'
						style={{left: tooltip.x + 8, top: tooltip.y - 8}}
					>
						<div className='font-bold'>{format(new Date(tooltip.date), "MMM d, yyyy")}</div>
						<div>
							{tooltip.count} activity ({getColorLabel(tooltip.count)})
						</div>
					</div>
				)}
			</div>
			<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2'>
				<div className='text-xs text-gray-500'>
					<span className='font-semibold text-[#344e41]'>{activeDays}</span> active days &nbsp;|&nbsp;
					<span className='font-semibold text-[#344e41]'>{currentStreak}</span> day streak &nbsp;|&nbsp;
					<span className='font-semibold text-[#344e41]'>{maxStreak}</span> longest streak
				</div>
				<div className='text-xs text-gray-400'>Tip: Stay active for a longer streak!</div>
			</div>
		</div>
	);
}
