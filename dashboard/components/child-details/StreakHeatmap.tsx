import React from "react";
import {format, subDays, eachDayOfInterval} from "date-fns";

// Helper to generate the last 52 weeks (1 year)
function getYearGrid() {
	const endDate = new Date();
	const startDate = subDays(endDate, 364); // 52 weeks * 7 days
	const days = eachDayOfInterval({start: startDate, end: endDate});
	// Group by week (columns)
	const weeks: (Date | null)[][] = [];
	let week: (Date | null)[] = [];
	days.forEach((day, idx) => {
		if (week.length === 0) {
			// Fill up to the first day of week
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
	// GitHub style: 0 = gray, 1-3 = light green, 4-6 = green, 7+ = dark green
	if (count === 0) return "bg-gray-200";
	if (count < 2) return "bg-green-100";
	if (count < 4) return "bg-green-300";
	if (count < 7) return "bg-green-500";
	return "bg-green-700";
}

export function StreakHeatmap({activityData}: {activityData: {date: string; count: number}[]}) {
	// Map date string to count
	const activityMap = React.useMemo(() => {
		const map = new Map<string, number>();
		activityData.forEach(({date, count}) => {
			map.set(format(new Date(date), "yyyy-MM-dd"), count);
		});
		return map;
	}, [activityData]);

	const weeks = getYearGrid();

	return (
		<div className='w-full rounded-2xl bg-white/40 backdrop-blur-md shadow p-4 md:p-6 border border-white/30 flex flex-col'>
			<div className='text-lg font-bold text-[#344e41] mb-4'>Activity Heatmap</div>
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
										)} border border-white/40 cursor-pointer transition duration-150 hover:scale-110`}
										title={`${dateStr}: ${count} activity`}
									/>
								);
							})}
						</div>
					))}
				</div>
			</div>
			<div className='text-xs text-gray-500 mt-2 text-center'>Last 12 months</div>
		</div>
	);
}
