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

export default function ChildrenPage() {
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const selectedChild = children.find((c) => c.child_id === selectedId);

	useEffect(() => {
		const fetchChildren = async () => {
			try {
				const data = await childrenApi.getMyChildren();
				setChildren(data);
				if (data.length > 0 && !selectedId) {
					setSelectedId(data[0].child_id);
				}
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
	}, [selectedId]);

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
		<div className='space-y-12'>
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
			<AnnouncementCard
				title='October Report'
				description='With the aid of our AI analysis you can receive a thoroughly informed and comprehensive evaluation of your data'
				icon={<Wand2 className='w-7 h-7 text-white' />}
				primaryButton={{text: "Try AI", icon: <Wand2 className='w-4 h-4' />}}
				secondaryButton={{text: "Learn More", href: "/learn-more"}}
			/>

			<div className='flex gap-6 w-full'>
				<div className='w-full max-w-xs'>
					<ChildrenList
						children={children.filter((child) => `${child.first_name} ${child.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))}
						selectedId={selectedId}
						onSelect={setSelectedId}
					/>
				</div>
				<div className='flex-1'>{selectedChild && <ChildDetails child={selectedChild} />}</div>
			</div>
		</div>
	);
}
