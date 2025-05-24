"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CalendarDateRangePicker} from "@/components/dashboard/date-range-picker";
import {Download, Users, Activity, CalendarCheck, Trophy, BookOpen, HelpCircle} from "lucide-react";
import {StatCard} from "@/components/dashboard/stat-card";
import {useState, useEffect} from "react";
import {useAuth} from "@/lib/context/auth-context";
import {Overview} from "@/components/dashboard/overview";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/store";
import {cn} from "@/lib/utils";
import {childrenApi, Child, Story} from "@/lib/api/children";

// Create a client component wrapper for Overview
function OverviewWrapper() {
	return <Overview />;
}

function ProgressChart({scores}: {scores: number[]}) {
	const max = Math.max(...scores, 100);
	return (
		<div className='flex items-end gap-2 h-32'>
			{scores.map((score, i) => (
				<div
					key={i}
					className='bg-primary rounded-lg w-8 flex items-end justify-center'
					style={{height: `${(score / max) * 100}%`}}
				>
					<span className='text-xs text-primary-foreground font-bold mb-1'>{score}</span>
				</div>
			))}
		</div>
	);
}

export default function DashboardPage() {
	const {user} = useAuth();
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
	const [childStats, setChildStats] = useState<any>(null);
	const [childStories, setChildStories] = useState<Story[]>([]);
	const [storiesLoading, setStoriesLoading] = useState(false);
	const [statsLoading, setStatsLoading] = useState(false);

	// Fetch children on mount
	useEffect(() => {
		const fetchChildren = async () => {
			try {
				const data = await childrenApi.getMyChildren();
				setChildren(data);
				if (data.length > 0) setSelectedChildId(data[0].child_id);
			} catch (e) {
				setChildren([]);
			} finally {
				setLoading(false);
			}
		};
		fetchChildren();
	}, []);

	// Fetch stats and stories for selected child
	useEffect(() => {
		if (!selectedChildId) return;
		setStatsLoading(true);
		setStoriesLoading(true);
		childrenApi
			.getChildStats(selectedChildId)
			.then(setChildStats)
			.catch(() => setChildStats(null))
			.finally(() => setStatsLoading(false));
		childrenApi
			.getChildStories(selectedChildId, 3, 0)
			.then((res) => setChildStories(res.stories))
			.catch(() => setChildStories([]))
			.finally(() => setStoriesLoading(false));
	}, [selectedChildId]);

	const childrenCount = children.length;
	const active = children.filter((c) => c.status === "Active").length;
	const inactive = childrenCount - active;

	const stats = [
		{
			label: "Total Children",
			value: childrenCount,
			icon: <Users className='w-7 h-7' />,
			color: "bg-[#e9f5ee]",
			iconColor: "text-[#344e41]",
		},
		{
			label: "Active",
			value: active,
			icon: <Activity className='w-7 h-7' />,
			color: "bg-[#fdf6e3]",
			iconColor: "text-[#b68900]",
		},
		{
			label: "Inactive",
			value: inactive,
			icon: <CalendarCheck className='w-7 h-7' />,
			color: "bg-[#fbeaea]",
			iconColor: "text-[#b94a48]",
		},
		{
			label: "Weekly Achievements",
			value: childStats?.achievements?.length ?? 0,
			icon: <Trophy className='w-7 h-7' />,
			color: "bg-[#e9f5ee]",
			iconColor: "text-[#344e41]",
		},
	];

	const selectedChild = children.find((c) => c.child_id === selectedChildId);

	// Aggregate quiz scores for all children
	const allQuizScores: number[] = [];
	children.forEach((child) => {
		// If stats for this child are loaded, use them
		if (selectedChildId === child.child_id && childStats?.quizScores) {
			allQuizScores.push(...childStats.quizScores);
		}
		// Optionally, fetch and aggregate more if you load stats for all children
	});

	// Fallback to mock data if no real data
	const overviewScores = allQuizScores.length > 0 ? allQuizScores : [80, 90, 85, 95, 100];

	return (
		<div className='space-y-10'>
			{/* Welcome Banner */}
			<div className='rounded-3xl bg-gradient-to-r from-[#a3b18a] via-[#e9f5ee] to-[#f5f7fa] p-8 shadow flex flex-col md:flex-row items-center justify-between'>
				<div>
					<div className='text-3xl md:text-4xl font-extrabold text-[#344e41] mb-2'>Welcome back, {user ? user.first_name : "Parent"}!</div>
					<div className='text-lg text-[#588157]'>Here's a quick overview of your children's progress.</div>
				</div>
				<img
					src='/images/puppet.png'
					className='w-28 h-28 md:w-36 md:h-36 rounded-xl object-cover'
					alt='Mascot'
				/>
			</div>

			{/* Stat Cards */}
			<div>
				<div className='mb-3 text-lg font-bold text-[#344e41]'>Quick Stats</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{stats.map((stat) => (
						<StatCard
							key={stat.label}
							label={stat.label}
							value={stat.value}
							icon={stat.icon}
							color={stat.color}
							iconColor={stat.iconColor}
						/>
					))}
				</div>
			</div>

			{/* Overview Chart */}
			<div>
				<div className='mb-3 text-lg font-bold text-[#344e41]'>Quiz Performance Overview</div>
				<Card className='rounded-3xl p-6 shadow'>
					<CardHeader>
						<CardTitle>Quiz Performance</CardTitle>
						<CardDescription>Recent quiz scores for your children</CardDescription>
					</CardHeader>
					<CardContent>
						<Overview scores={overviewScores} />
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity Feed */}
			<div>
				<div className='mb-3 text-lg font-bold text-[#344e41]'>Recent Activity</div>
				<Card className='rounded-3xl p-6 flex flex-col gap-6 shadow bg-gradient-to-br from-[#e9f5ee] via-[#f5f7fa] to-[#fff]'>
					<ul className='space-y-4'>
						{children.length === 0 ? (
							<li className='text-gray-400 italic'>No activity found.</li>
						) : (
							children.slice(0, 3).map((child) => (
								<li
									key={child.child_id}
									className='flex items-center gap-4'
								>
									<div className='w-10 h-10 rounded-full bg-[#344e41]/10 flex items-center justify-center font-bold text-[#344e41] text-lg'>
										{child.first_name[0]}
										{child.last_name[0]}
									</div>
									<div>
										<div className='font-semibold text-[#344e41]'>
											{child.first_name} {child.last_name}
										</div>
										<div className='text-sm text-gray-500'>Recently read a story or completed a quiz</div>
									</div>
								</li>
							))
						)}
					</ul>
				</Card>
			</div>

			{/* Recent Achievements Grid */}
			<div>
				<div className='mb-3 text-lg font-bold text-[#344e41]'>Recent Achievements</div>
				<Card className='rounded-3xl p-6 shadow bg-gradient-to-br from-[#f5f7fa] via-[#e9f5ee] to-[#a3b18a]'>
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
						{(childStats?.achievements && childStats.achievements.length > 0
							? childStats.achievements.slice(0, 6)
							: [
									{title: "Reading Champion", description: "Completed 10 stories", icon: <BookOpen className='w-8 h-8 text-[#344e41]' />},
									{title: "Quiz Master", description: "Scored 90%+ in quizzes", icon: <HelpCircle className='w-8 h-8 text-[#588157]' />},
									{title: "Streak Star", description: "7-day learning streak", icon: <Trophy className='w-8 h-8 text-[#b68900]' />},
							  ]
						).map((ach: any, idx: number) => (
							<div
								key={idx}
								className='flex items-center gap-4 bg-white/80 rounded-xl p-4 shadow-sm'
							>
								<div>{ach.icon}</div>
								<div>
									<div className='font-bold text-[#344e41]'>{ach.title}</div>
									<div className='text-sm text-gray-500'>{ach.description}</div>
								</div>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	);
}
