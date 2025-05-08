"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {childrenApi, Child} from "@/lib/api/children";
import {Button} from "@/components/ui/button";
import {
	ArrowLeft,
	User,
	Calendar,
	Edit,
	Activity,
	BookOpen,
	Trophy,
	BarChart2,
	Clock,
	BookMarked,
	Target,
	Star,
	ChevronRight,
	Settings,
	MoreVertical,
	TrendingUp,
	CheckCircle2,
	XCircle,
	HelpCircle,
} from "lucide-react";
import {toast} from "sonner";
import {format} from "date-fns";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Progress} from "@/components/ui/progress";
import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

// Mock data for demonstration
const mockProgress = {
	readingLevel: 75,
	mathSkills: 60,
	vocabulary: 85,
	comprehension: 70,
};

const mockRecentActivities = [
	{
		id: 1,
		type: "story",
		title: "The Magic Garden",
		date: "2024-03-15",
		duration: "15 mins",
		score: 95,
	},
	{
		id: 2,
		type: "quiz",
		title: "Basic Math Quiz",
		date: "2024-03-14",
		duration: "10 mins",
		score: 88,
	},
	{
		id: 3,
		type: "story",
		title: "Space Adventure",
		date: "2024-03-13",
		duration: "20 mins",
		score: 92,
	},
];

const mockAchievements = [
	{
		id: 1,
		title: "Reading Champion",
		description: "Completed 10 stories",
		date: "2024-03-10",
		icon: <BookOpen className='w-5 h-5' />,
	},
	{
		id: 2,
		title: "Math Wizard",
		description: "Scored 100% in math quiz",
		date: "2024-03-08",
		icon: <Target className='w-5 h-5' />,
	},
	{
		id: 3,
		title: "Vocabulary Master",
		description: "Learned 50 new words",
		date: "2024-03-05",
		icon: <Star className='w-5 h-5' />,
	},
];

// Mock vocabulary data
const mockVocabularyData = [
	{month: "Jan", words: 45},
	{month: "Feb", words: 62},
	{month: "Mar", words: 78},
	{month: "Apr", words: 91},
	{month: "May", words: 85},
	{month: "Jun", words: 103},
	{month: "Jul", words: 120},
	{month: "Aug", words: 95},
	{month: "Sep", words: 110},
	{month: "Oct", words: 125},
	{month: "Nov", words: 140},
	{month: "Dec", words: 155},
];

// Add mock quiz data
const mockQuizzes = {
	completed: [
		{
			id: 1,
			title: "Basic Math Quiz",
			subject: "Mathematics",
			date: "2024-03-15",
			score: 85,
			totalQuestions: 20,
			correctAnswers: 17,
			duration: "15 mins",
			topics: ["Addition", "Subtraction", "Basic Multiplication"],
		},
		{
			id: 2,
			title: "Reading Comprehension",
			subject: "English",
			date: "2024-03-10",
			score: 92,
			totalQuestions: 15,
			correctAnswers: 14,
			duration: "20 mins",
			topics: ["Reading", "Comprehension", "Vocabulary"],
		},
		{
			id: 3,
			title: "Science Basics",
			subject: "Science",
			date: "2024-03-05",
			score: 78,
			totalQuestions: 25,
			correctAnswers: 20,
			duration: "25 mins",
			topics: ["Plants", "Animals", "Basic Physics"],
		},
	],
	upcoming: [
		{
			id: 4,
			title: "Advanced Math Quiz",
			subject: "Mathematics",
			date: "2024-03-20",
			duration: "30 mins",
			topics: ["Multiplication", "Division", "Fractions"],
		},
		{
			id: 5,
			title: "Story Writing",
			subject: "English",
			date: "2024-03-22",
			duration: "45 mins",
			topics: ["Creative Writing", "Grammar", "Story Structure"],
		},
	],
	performance: {
		averageScore: 85,
		totalQuizzes: 3,
		completedQuizzes: 3,
		upcomingQuizzes: 2,
		bestSubject: "English",
		bestScore: 92,
		improvement: "+7%",
	},
};

export default function ChildDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [child, setChild] = useState<Child | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchChildDetails = async () => {
			try {
				const children = await childrenApi.getMyChildren();
				const childData = children.find((c) => c.child_id === params.id);

				if (!childData) {
					toast.error("Child not found");
					router.push("/dashboard/children");
					return;
				}

				setChild(childData);
			} catch (error) {
				console.error("Error fetching child details:", error);
				toast.error("Failed to load child details", {
					description: "Please try again later",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchChildDetails();
	}, [params.id, router]);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41]'></div>
			</div>
		);
	}

	if (!child) {
		return null;
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						onClick={() => router.back()}
						className='hover:bg-gray-100'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back
					</Button>
					<div>
						<h1 className='text-2xl font-bold text-[#344e41]'>
							{child.first_name} {child.last_name}
						</h1>
						<p className='text-sm text-gray-500'>Student ID: {child.child_id}</p>
					</div>
				</div>
				<div className='flex items-center gap-3'>
					<Button
						variant='outline'
						className='gap-2'
					>
						<Settings className='w-4 h-4' />
						Settings
					</Button>
					<Button className='bg-[#344e41] hover:bg-[#344e41]/90 gap-2'>
						<Edit className='w-4 h-4' />
						Edit Profile
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
							>
								<MoreVertical className='w-4 h-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem>View Reports</DropdownMenuItem>
							<DropdownMenuItem>Download Progress</DropdownMenuItem>
							<DropdownMenuItem>Share Profile</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Main Content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left Column - Profile and Stats */}
				<div className='space-y-6'>
					{/* Profile Card */}
					<Card>
						<CardHeader>
							<CardTitle>Profile Information</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div className='flex items-center gap-4'>
								<div className='w-20 h-20 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
									<User className='w-10 h-10 text-[#344e41]' />
								</div>
								<div>
									<h2 className='text-xl font-semibold text-[#344e41]'>
										{child.first_name} {child.last_name}
									</h2>
									<p className='text-gray-500'>{child.nickname}</p>
									<div className='flex items-center gap-2 mt-1'>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
											}`}
										>
											{child.status}
										</span>
									</div>
								</div>
							</div>

							<div className='space-y-4'>
								<div className='flex items-center gap-2 text-gray-600'>
									<Calendar className='w-4 h-4' />
									<span>Born {format(new Date(child.birth_date), "MMMM d, yyyy")}</span>
								</div>
								<div className='flex items-center gap-2 text-gray-600'>
									<Clock className='w-4 h-4' />
									<span>Member since {format(new Date(child.created_at), "MMMM yyyy")}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Progress Overview */}
					<Card>
						<CardHeader>
							<CardTitle>Learning Progress</CardTitle>
							<CardDescription>Overall performance in different areas</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Reading Level</span>
									<span className='font-medium'>{mockProgress.readingLevel}%</span>
								</div>
								<Progress
									value={mockProgress.readingLevel}
									className='h-2'
								/>
							</div>
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Math Skills</span>
									<span className='font-medium'>{mockProgress.mathSkills}%</span>
								</div>
								<Progress
									value={mockProgress.mathSkills}
									className='h-2'
								/>
							</div>
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Vocabulary</span>
									<span className='font-medium'>{mockProgress.vocabulary}%</span>
								</div>
								<Progress
									value={mockProgress.vocabulary}
									className='h-2'
								/>
							</div>
							<div className='space-y-2'>
								<div className='flex justify-between text-sm'>
									<span>Comprehension</span>
									<span className='font-medium'>{mockProgress.comprehension}%</span>
								</div>
								<Progress
									value={mockProgress.comprehension}
									className='h-2'
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Tabs Content */}
				<div className='lg:col-span-2'>
					<Tabs
						defaultValue='overview'
						className='space-y-4'
					>
						<TabsList>
							<TabsTrigger value='overview'>Overview</TabsTrigger>
							<TabsTrigger value='activities'>Activities</TabsTrigger>
							<TabsTrigger value='achievements'>Achievements</TabsTrigger>
							<TabsTrigger value='quizzes'>Quizzes</TabsTrigger>
							<TabsTrigger value='reports'>Reports</TabsTrigger>
						</TabsList>

						<TabsContent
							value='overview'
							className='space-y-4'
						>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Total Stories Read</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>24</div>
										<p className='text-xs text-muted-foreground'>+2 from last week</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Average Score</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>92%</div>
										<p className='text-xs text-muted-foreground'>+5% from last month</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Time Spent</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>12.5 hrs</div>
										<p className='text-xs text-muted-foreground'>This month</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Achievements</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>8</div>
										<p className='text-xs text-muted-foreground'>Badges earned</p>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle>Recent Activities</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{mockRecentActivities.map((activity) => (
											<div
												key={activity.id}
												className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
											>
												<div className='flex items-center gap-4'>
													<div className='w-10 h-10 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
														{activity.type === "story" ? (
															<BookMarked className='w-5 h-5 text-[#344e41]' />
														) : (
															<Target className='w-5 h-5 text-[#344e41]' />
														)}
													</div>
													<div>
														<h4 className='font-medium text-[#344e41]'>{activity.title}</h4>
														<p className='text-sm text-gray-500'>
															{format(new Date(activity.date), "MMM d, yyyy")} • {activity.duration}
														</p>
													</div>
												</div>
												<div className='flex items-center gap-4'>
													<span className='text-sm font-medium text-[#344e41]'>Score: {activity.score}%</span>
													<ChevronRight className='w-4 h-4 text-gray-400' />
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value='activities'
							className='space-y-4'
						>
							<Card>
								<CardHeader>
									<CardTitle>Activity History</CardTitle>
									<CardDescription>Detailed view of all activities</CardDescription>
								</CardHeader>
								<CardContent>{/* Activity history content */}</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value='achievements'
							className='space-y-4'
						>
							<Card>
								<CardHeader>
									<CardTitle>Achievements & Badges</CardTitle>
									<CardDescription>Recognitions and milestones</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										{mockAchievements.map((achievement) => (
											<div
												key={achievement.id}
												className='p-4 bg-gray-50 rounded-lg space-y-2'
											>
												<div className='flex items-center gap-3'>
													<div className='w-8 h-8 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
														{achievement.icon}
													</div>
													<h4 className='font-medium text-[#344e41]'>{achievement.title}</h4>
												</div>
												<p className='text-sm text-gray-500'>{achievement.description}</p>
												<p className='text-xs text-gray-400'>{format(new Date(achievement.date), "MMM d, yyyy")}</p>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value='quizzes'
							className='space-y-6'
						>
							{/* Quiz Performance Overview */}
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Average Score</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>{mockQuizzes.performance.averageScore}%</div>
										<p className='text-xs text-muted-foreground flex items-center gap-1'>
											<TrendingUp className='h-3 w-3 text-green-500' />
											{mockQuizzes.performance.improvement} from last month
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Completed Quizzes</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>{mockQuizzes.performance.completedQuizzes}</div>
										<p className='text-xs text-muted-foreground'>Out of {mockQuizzes.performance.totalQuizzes} total</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Best Subject</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>{mockQuizzes.performance.bestSubject}</div>
										<p className='text-xs text-muted-foreground'>Score: {mockQuizzes.performance.bestScore}%</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className='pb-2'>
										<CardTitle className='text-sm font-medium'>Upcoming Quizzes</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>{mockQuizzes.performance.upcomingQuizzes}</div>
										<p className='text-xs text-muted-foreground'>Next quiz in 2 days</p>
									</CardContent>
								</Card>
							</div>

							{/* Completed Quizzes */}
							<Card>
								<CardHeader>
									<CardTitle>Completed Quizzes</CardTitle>
									<CardDescription>Detailed view of quiz performance</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{mockQuizzes.completed.map((quiz) => (
											<div
												key={quiz.id}
												className='p-4 bg-gray-50 rounded-lg space-y-3'
											>
												<div className='flex items-center justify-between'>
													<div className='space-y-1'>
														<h4 className='font-medium text-[#344e41]'>{quiz.title}</h4>
														<div className='flex items-center gap-2 text-sm text-muted-foreground'>
															<span>{quiz.subject}</span>
															<span>•</span>
															<span>{format(new Date(quiz.date), "MMM d, yyyy")}</span>
															<span>•</span>
															<span>{quiz.duration}</span>
														</div>
													</div>
													<div className='flex items-center gap-4'>
														<div className='text-right'>
															<div className='text-lg font-bold text-[#344e41]'>{quiz.score}%</div>
															<div className='text-xs text-muted-foreground'>
																{quiz.correctAnswers}/{quiz.totalQuestions} correct
															</div>
														</div>
														<ChevronRight className='h-5 w-5 text-muted-foreground' />
													</div>
												</div>
												<div className='flex flex-wrap gap-2'>
													{quiz.topics.map((topic, index) => (
														<span
															key={index}
															className='px-2 py-1 bg-[#344e41]/10 text-[#344e41] text-xs rounded-full'
														>
															{topic}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Upcoming Quizzes */}
							<Card>
								<CardHeader>
									<CardTitle>Upcoming Quizzes</CardTitle>
									<CardDescription>Quizzes scheduled for the future</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='space-y-4'>
										{mockQuizzes.upcoming.map((quiz) => (
											<div
												key={quiz.id}
												className='p-4 bg-gray-50 rounded-lg space-y-3'
											>
												<div className='flex items-center justify-between'>
													<div className='space-y-1'>
														<h4 className='font-medium text-[#344e41]'>{quiz.title}</h4>
														<div className='flex items-center gap-2 text-sm text-muted-foreground'>
															<span>{quiz.subject}</span>
															<span>•</span>
															<span>{format(new Date(quiz.date), "MMM d, yyyy")}</span>
															<span>•</span>
															<span>{quiz.duration}</span>
														</div>
													</div>
													<Button
														variant='outline'
														size='sm'
														className='gap-2'
													>
														<HelpCircle className='h-4 w-4' />
														View Details
													</Button>
												</div>
												<div className='flex flex-wrap gap-2'>
													{quiz.topics.map((topic, index) => (
														<span
															key={index}
															className='px-2 py-1 bg-[#344e41]/10 text-[#344e41] text-xs rounded-full'
														>
															{topic}
														</span>
													))}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value='reports'
							className='space-y-4'
						>
							<Card>
								<CardHeader>
									<CardTitle>Performance Reports</CardTitle>
									<CardDescription>Detailed analytics and insights</CardDescription>
								</CardHeader>
								<CardContent className='space-y-6'>
									{/* Vocabulary Learning Progress */}
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<div>
												<h3 className='text-lg font-semibold text-[#344e41]'>Vocabulary Learning Progress</h3>
												<p className='text-sm text-gray-500'>Number of new words learned per month</p>
											</div>
											<div className='flex items-center gap-2 text-green-600'>
												<TrendingUp className='w-4 h-4' />
												<span className='text-sm font-medium'>+24% from last month</span>
											</div>
										</div>
										<div className='h-[300px] w-full'>
											<ResponsiveContainer
												width='100%'
												height='100%'
											>
												<AreaChart data={mockVocabularyData}>
													<defs>
														<linearGradient
															id='colorWords'
															x1='0'
															y1='0'
															x2='0'
															y2='1'
														>
															<stop
																offset='5%'
																stopColor='#344e41'
																stopOpacity={0.1}
															/>
															<stop
																offset='95%'
																stopColor='#344e41'
																stopOpacity={0}
															/>
														</linearGradient>
													</defs>
													<XAxis
														dataKey='month'
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
														tickFormatter={(value) => `${value}`}
													/>
													<Tooltip
														content={({active, payload}) => {
															if (active && payload && payload.length) {
																return (
																	<div className='rounded-lg border bg-white p-2 shadow-sm'>
																		<div className='grid grid-cols-2 gap-2'>
																			<div className='flex flex-col'>
																				<span className='text-[0.70rem] uppercase text-muted-foreground'>Words</span>
																				<span className='font-bold text-[#344e41]'>{payload[0].value}</span>
																			</div>
																			<div className='flex flex-col'>
																				<span className='text-[0.70rem] uppercase text-muted-foreground'>Month</span>
																				<span className='font-bold text-[#344e41]'>{payload[0].payload.month}</span>
																			</div>
																		</div>
																	</div>
																);
															}
															return null;
														}}
													/>
													<Area
														type='monotone'
														dataKey='words'
														stroke='#344e41'
														fillOpacity={1}
														fill='url(#colorWords)'
														strokeWidth={2}
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
										<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
											<div className='p-4 bg-gray-50 rounded-lg'>
												<div className='text-sm text-gray-500'>Total Words</div>
												<div className='text-2xl font-bold text-[#344e41]'>1,105</div>
											</div>
											<div className='p-4 bg-gray-50 rounded-lg'>
												<div className='text-sm text-gray-500'>Average per Month</div>
												<div className='text-2xl font-bold text-[#344e41]'>92</div>
											</div>
											<div className='p-4 bg-gray-50 rounded-lg'>
												<div className='text-sm text-gray-500'>Best Month</div>
												<div className='text-2xl font-bold text-[#344e41]'>Dec (155)</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
