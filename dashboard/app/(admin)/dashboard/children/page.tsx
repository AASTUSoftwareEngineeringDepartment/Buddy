"use client";

import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/lib/store";
import {ChildrenList} from "@/components/children/ChildrenList";
import {ChildDetails} from "@/components/children/ChildDetails";
import {childrenApi, Child} from "@/lib/api/children";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Plus, Search} from "lucide-react";
import Link from "next/link";
import {Input} from "@/components/ui/input";
import {AnnouncementCard} from "@/components/children/AnnouncementCard";
import {Wand2} from "lucide-react";
import {AddChildCard} from "@/components/children/AddChildCard";
import {ChildrenTable} from "@/components/children/ChildrenTable";
import {StatCard} from "@/components/children/StatCard";
import {Users, UserCheck, UserX} from "lucide-react";

export default function ChildrenPage() {
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	const total = children.length;
	const active = children.filter((c) => c.status === "Active").length;
	const inactive = total - active;

	useEffect(() => {
		const fetchChildren = async () => {
			try {
				const data = await childrenApi.getMyChildren();
				setChildren(data);
			} catch (error) {
				console.error("Error fetching children:", error);
				toast.error("Failed to load children", {
					description: "Please try again later",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchChildren();
	}, []);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41]'></div>
			</div>
		);
	}

	if (!children.length) {
		return <div className='flex items-center justify-center min-h-[60vh] text-gray-500'>No children found.</div>;
	}

	return (
		<div className='space-y-8'>
			{/* Full width search bar and button */}
			<div className='flex items-center justify-between gap-4'>
				<div className='relative flex-1 max-w-sm'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<Input
						placeholder='Search children...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-9'
					/>
				</div>
				<Link href='/dashboard/add-child'>
					<Button className='bg-[#344e41] hover:bg-[#344e41]/90'>
						<Plus className='w-4 h-4 mr-2' />
						Create Child
					</Button>
				</Link>
			</div>
			{/* Full width announcement card */}
			<AnnouncementCard
				title='October Report'
				description='With the aid of our AI analysis you can receive a thoroughly informed and comprehensive evaluation of your data'
				icon={<Wand2 className='w-7 h-7 text-white' />}
				primaryButton={{text: "Try AI", icon: <Wand2 className='w-4 h-4' />}}
				secondaryButton={{text: "Learn More", href: "/learn-more"}}
			/>
			{/* Split row: table left, stat cards right */}
			<div className='flex flex-col lg:flex-row gap-8'>
				<div className='w-1/2 flex flex-col'>
					<ChildrenTable
						children={children.filter((child) => `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))}
					/>
				</div>
				<div className='w-1/2 flex flex-col gap-6'>
					<div className='grid grid-cols-2 gap-4'>
						<StatCard
							label='Total Children'
							value={total}
							icon={<Users className='w-6 h-6' />}
						/>
						<StatCard
							label='Active'
							value={active}
							icon={<UserCheck className='w-6 h-6' />}
						/>
						<StatCard
							label='Inactive'
							value={inactive}
							icon={<UserX className='w-6 h-6' />}
						/>
						<StatCard
							label='Pending'
							value={0}
							icon={<Users className='w-6 h-6' />}
						/>
					</div>
					<AddChildCard />
				</div>
			</div>
		</div>
	);
}
