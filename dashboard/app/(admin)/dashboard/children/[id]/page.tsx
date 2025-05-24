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
import {format, subDays} from "date-fns";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Progress} from "@/components/ui/progress";
import {Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ProfileCard} from "@/components/child-details/ProfileCard";
import {StatsGraph} from "@/components/child-details/StatsGraph";
import {VocabularyList} from "@/components/child-details/VocabularyList";
import {StoriesList} from "@/components/child-details/StoriesList";
import {QuestionsStats} from "@/components/child-details/QuestionsStats";
import {AchievementsList} from "@/components/child-details/AchievementsList";
import {RewardsCard} from "@/components/child-details/RewardsCard";
import {ChildDetailsNavbar} from "@/components/child-details/ChildDetailsNavbar";
import {Dialog} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {EditChildModal} from "@/components/child-details/EditChildModal";
import {ChildSettingsModal} from "@/components/child-details/ChildSettingsModal";
import {StreakProgress} from "@/components/child-details/StreakProgress";
import {StreakHeatmap} from "@/components/child-details/StreakHeatmap";
import {CircularStatsGraph} from "@/components/child-details/CircularStatsGraph";
import {QuestionsAccordion} from "@/components/child-details/QuestionsAccordion";

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

// Generate mock activity data for the last 180 days
const today = new Date();
const mockActivityData = Array.from({length: 180}).map((_, i) => {
	const date = subDays(today, 179 - i);
	// More activity on weekdays, less on weekends
	const count = [0, 1, 2, 3, 4, 5][Math.floor(Math.random() * 6)];
	return {
		date: format(date, "yyyy-MM-dd"),
		count: date.getDay() === 0 || date.getDay() === 6 ? Math.floor(count / 2) : count,
	};
});

export default function ChildDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const [child, setChild] = useState<Child | null>(null);
	const [loading, setLoading] = useState(true);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		birth_date: "",
		nickname: "",
		password: "",
	});

	// Settings modal state
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [settingsLoading, setSettingsLoading] = useState(false);
	const [settingsForm, setSettingsForm] = useState({
		favorite_animal: "",
		favorite_character: "",
		screen_time: 0,
		preferences: [],
		themes: [],
		moral_values: [],
	});

	const [rewards, setRewards] = useState({xp: 0, level: 0});
	const [streakData, setStreakData] = useState<any>(null);
	const [stats, setStats] = useState<any>(null);
	const [questions, setQuestions] = useState<any[]>([]);
	const [questionsTotal, setQuestionsTotal] = useState<number>(0);
	const [questionsPage, setQuestionsPage] = useState<number>(0);
	const questionsLimit = 5;

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
				setForm({
					first_name: childData.first_name,
					last_name: childData.last_name,
					birth_date: childData.birth_date?.slice(0, 10) ?? "",
					nickname: childData.nickname ?? "",
					password: "",
				});

				const rewardsData = await childrenApi.getChildRewards(childData.child_id);
				setRewards(rewardsData);

				const streak = await childrenApi.getChildStreak(childData.child_id);
				setStreakData(streak);
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

	useEffect(() => {
		if (!child) return;
		const fetchStats = async () => {
			try {
				const data = await childrenApi.getChildStats(child.child_id);
				setStats(data);
			} catch (e) {
				// Optionally handle error
			}
		};
		fetchStats();
	}, [child]);

	useEffect(() => {
		if (!child) return;
		const fetchQuestions = async () => {
			try {
				const {questions, total} = await childrenApi.getChildQuestions(child.child_id, questionsLimit, questionsPage * questionsLimit);
				setQuestions(questions);
				setQuestionsTotal(total ?? 0);
			} catch (e) {
				// Optionally handle error
			}
		};
		fetchQuestions();
	}, [child, questionsPage]);

	const handleEdit = () => setEditOpen(true);
	const handleEditClose = () => setEditOpen(false);

	const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!child) return;
		const payload: Record<string, string> = {};
		if (form.first_name && form.first_name !== child.first_name) payload.first_name = form.first_name;
		if (form.last_name && form.last_name !== child.last_name) payload.last_name = form.last_name;
		if (form.nickname && form.nickname !== child.nickname) payload.nickname = form.nickname;
		if (form.birth_date && form.birth_date !== child.birth_date?.slice(0, 10)) payload.birth_date = form.birth_date;
		if (form.password) payload.password = form.password;
		try {
			const updated = await childrenApi.updateChildProfile(params.id as string, payload);
			setChild((prev) => (prev ? {...prev, ...updated} : updated));
			toast.success("Child updated!");
			handleEditClose();
		} catch (err) {
			toast.error("Failed to update child");
		}
	};

	// Settings modal handlers
	const handleSettings = async () => {
		if (!child) return;
		setSettingsLoading(true);
		try {
			const data = await childrenApi.getChildSettings(child.child_id);
			setSettingsForm({
				favorite_animal: data.favorite_animal || "",
				favorite_character: data.favorite_character || "",
				screen_time: data.screen_time || 0,
				preferences: Array.isArray(data.preferences) ? data.preferences : [],
				themes: Array.isArray(data.themes) ? data.themes : [],
				moral_values: Array.isArray(data.moral_values) ? data.moral_values : [],
			});
			setSettingsOpen(true);
		} catch (err) {
			toast.error("Failed to load settings");
		} finally {
			setSettingsLoading(false);
		}
	};

	const handleSettingsFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value, type} = e.target;
		setSettingsForm((prev) => ({
			...prev,
			[name]: type === "number" ? Number(value) : value,
		}));
	};

	const handleTagsChange = (field: "preferences" | "themes" | "moral_values", tags: string[]) => {
		setSettingsForm((prev) => ({
			...prev,
			[field]: tags,
		}));
	};

	const handleSettingsSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!child) return;
		const payload = {
			child_id: child.child_id,
			favorite_animal: settingsForm.favorite_animal,
			favorite_character: settingsForm.favorite_character,
			screen_time: settingsForm.screen_time,
			preferences: settingsForm.preferences,
			themes: settingsForm.themes,
			moral_values: settingsForm.moral_values,
		};
		try {
			await childrenApi.updateChildSettings(child.child_id, payload);
			toast.success("Settings updated!");
			setSettingsOpen(false);
		} catch (err) {
			toast.error("Failed to update settings");
		}
	};

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

	console.log(questions);

	return (
		<div className='px-2 md:px-8 py-8 space-y-8'>
			<ChildDetailsNavbar
				child={{
					first_name: child.first_name,
					last_name: child.last_name,
					nickname: child.nickname,
					xp: rewards?.xp ?? 0,
					level: rewards?.level ?? 0,
				}}
				onEdit={handleEdit}
				onSettings={handleSettings}
			/>
			<EditChildModal
				open={editOpen}
				onOpenChange={setEditOpen}
				onSubmit={handleEditSubmit}
				onCancel={handleEditClose}
				form={{
					first_name: form.first_name,
					last_name: form.last_name,
					nickname: form.nickname,
				}}
				handleFormChange={handleFormChange}
			/>
			<ChildSettingsModal
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
				onSubmit={handleSettingsSubmit}
				onCancel={() => setSettingsOpen(false)}
				form={settingsForm}
				handleFormChange={handleSettingsFormChange}
				handleTagsChange={handleTagsChange}
			/>
			{/* Two-column layout below navbar */}
			<div className='grid grid-cols-1 md:grid-cols-6 gap-8'>
				{/* Left column: Streak Progress */}
				<div className='md:col-span-2 flex flex-col gap-6'>
					<StreakProgress streakData={streakData} />
					{stats && (
						<CircularStatsGraph
							solved={stats.solved}
							total={stats.total}
							attempting={stats.attempting}
							easy={stats.easy}
							medium={stats.medium}
							hard={stats.hard}
						/>
					)}
				</div>
				{/* Main content right */}
				<div className='md:col-span-4 flex flex-col gap-8'>
					<StoriesList />
					<StreakHeatmap activityData={mockActivityData} />
				</div>
			</div>
			{/* Full width questions accordion below the grid */}
			{questions.length > 0 && (
				<QuestionsAccordion
					questions={questions}
					page={questionsPage}
					limit={questionsLimit}
					total={questionsTotal || questions.length}
					onPageChange={setQuestionsPage}
				/>
			)}
		</div>
	);
}
