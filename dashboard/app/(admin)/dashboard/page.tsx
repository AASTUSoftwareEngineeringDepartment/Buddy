"use client";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CalendarDateRangePicker} from "@/components/dashboard/date-range-picker";
import {Download, Users, Activity, CalendarCheck, Trophy, BookOpen, HelpCircle} from "lucide-react";
import {StatCard} from "@/components/dashboard/stat-card";
import {useState} from "react";
import {useAuth} from "@/lib/context/auth-context";
import {Overview} from "@/components/dashboard/overview";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/store";

// Create a client component wrapper for Overview
function OverviewWrapper() {
	return <Overview />;
}

const children = [
	{name: "Emma", id: 1},
	{name: "Liam", id: 2},
];

const childProgress = {
	Emma: {
		quizScores: [80, 90, 85, 95, 100],
		recentStories: [
			{title: "The Brave Bunny", date: "2024-06-01"},
			{title: "Space Adventure", date: "2024-05-28"},
		],
		recentQuizzes: [
			{title: "Math Quiz", score: 95, date: "2024-06-02"},
			{title: "Science Quiz", score: 90, date: "2024-05-30"},
		],
	},
	Liam: {
		quizScores: [70, 75, 80, 85, 90],
		recentStories: [
			{title: "The Lost Puppy", date: "2024-06-01"},
			{title: "Jungle Mystery", date: "2024-05-27"},
		],
		recentQuizzes: [
			{title: "Reading Quiz", score: 85, date: "2024-06-02"},
			{title: "Shapes Quiz", score: 80, date: "2024-05-29"},
		],
	},
};

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
	const [selectedChild, setSelectedChild] = useState(children[0].name);
	const progress = childProgress[selectedChild as keyof typeof childProgress];
	const {user} = useAuth();
	const childrenCount = useSelector((state: RootState) => state.children.children.length);

	const stats = [
		{
			label: "Total Children",
			value: childrenCount,
			icon: <Users className='w-7 h-7' />,
			color: "bg-secondary",
			iconColor: "text-primary",
		},
		{
			label: "Recent Activity",
			value: "5 actions",
			icon: <Activity className='w-7 h-7' />,
			color: "bg-secondary",
			iconColor: "text-primary",
		},
		{
			label: "Upcoming Quizzes",
			value: 2,
			icon: <CalendarCheck className='w-7 h-7' />,
			color: "bg-secondary",
			iconColor: "text-primary",
		},
		{
			label: "Weekly Achievements",
			value: 3,
			icon: <Trophy className='w-7 h-7' />,
			color: "bg-secondary",
			iconColor: "text-primary",
		},
	];

	return (
		<div className='space-y-8'>
			{/* Welcome Card */}
			<Card className='rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between'>
				<div>
					<h1 className='text-3xl md:text-4xl font-bold text-card-foreground mb-2'>Welcome, {user ? user.first_name : "Parent"}! 👋</h1>
					<p className='text-lg text-muted-foreground'>Here's what's happening with your children this week.</p>
				</div>
				<img
					src='/dashboard-welcome.svg'
					alt='Welcome'
					className='w-32 h-32 md:w-40 md:h-40'
				/>
			</Card>

			{/* Stat Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				{stats.map((stat) => (
					<StatCard
						key={stat.label}
						{...stat}
					/>
				))}
			</div>

			{/* Overview Chart */}
			<Card className='rounded-3xl p-6'>
				<CardHeader>
					<CardTitle>Overview</CardTitle>
					<CardDescription>Monthly activity overview</CardDescription>
				</CardHeader>
				<CardContent>
					<OverviewWrapper />
				</CardContent>
			</Card>

			{/* Child Progress Section */}
			<Card className='rounded-3xl p-6 flex flex-col gap-6'>
				<div className='flex items-center gap-4 mb-4'>
					<h2 className='text-2xl font-bold text-card-foreground flex-1'>Child Progress</h2>
					<div className='flex gap-2'>
						{children.map((child) => (
							<Button
								key={child.id}
								onClick={() => setSelectedChild(child.name)}
								variant={selectedChild === child.name ? "default" : "secondary"}
								className='rounded-full text-lg'
								aria-pressed={selectedChild === child.name}
							>
								{child.name}
							</Button>
						))}
					</div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					{/* Chart */}
					<div>
						<h3 className='text-lg font-semibold text-card-foreground mb-2'>Quiz Performance</h3>
						<ProgressChart scores={progress.quizScores} />
					</div>
					{/* Recent Activity */}
					<div>
						<h3 className='text-lg font-semibold text-card-foreground mb-2'>Recent Stories</h3>
						<ul className='space-y-2 mb-4'>
							{progress.recentStories.map((story, i) => (
								<li
									key={i}
									className='flex items-center gap-2 bg-secondary rounded-xl px-4 py-2'
								>
									<BookOpen className='w-5 h-5 text-primary' />
									<span className='font-medium text-card-foreground'>{story.title}</span>
									<span className='ml-auto text-xs text-muted-foreground'>{story.date}</span>
								</li>
							))}
						</ul>
						<h3 className='text-lg font-semibold text-card-foreground mb-2'>Recent Quizzes</h3>
						<ul className='space-y-2'>
							{progress.recentQuizzes.map((quiz, i) => (
								<li
									key={i}
									className='flex items-center gap-2 bg-secondary rounded-xl px-4 py-2'
								>
									<HelpCircle className='w-5 h-5 text-primary' />
									<span className='font-medium text-card-foreground'>{quiz.title}</span>
									<span className='ml-auto text-xs text-muted-foreground'>{quiz.date}</span>
									<span className='ml-2 text-sm font-bold text-primary'>{quiz.score}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</Card>
		</div>
	);
}
