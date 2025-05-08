"use client";

import {useEffect, useState} from "react";
import {childrenApi, Child} from "@/lib/api/children";
import {Button} from "@/components/ui/button";
import {Plus, User, Calendar, ChevronRight, Search} from "lucide-react";
import {toast} from "sonner";
import Link from "next/link";
import {format} from "date-fns";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";

export default function ChildrenPage() {
	const router = useRouter();
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

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

	const handleChildClick = (childId: string) => {
		router.push(`/dashboard/children/${childId}`);
	};

	const filteredChildren = children.filter(
		(child) =>
			child.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			child.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			child.nickname.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41]'></div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1 className='text-2xl font-bold text-[#344e41]'>My Children</h1>
					<p className='text-gray-500 mt-1'>Manage and monitor your children's progress</p>
				</div>
				<Link href='/dashboard/add-child'>
					<Button className='bg-[#344e41] hover:bg-[#344e41]/90'>
						<Plus className='w-4 h-4 mr-2' />
						Add Child
					</Button>
				</Link>
			</div>

			{children.length === 0 ? (
				<div className='bg-white rounded-lg p-8 text-center'>
					<User className='w-12 h-12 text-gray-400 mx-auto mb-4' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>No children added yet</h3>
					<p className='text-gray-500 mb-4'>Start by adding your first child to track their progress and achievements.</p>
					<Link href='/dashboard/add-child'>
						<Button className='bg-[#344e41] hover:bg-[#344e41]/90'>
							<Plus className='w-4 h-4 mr-2' />
							Add Child
						</Button>
					</Link>
				</div>
			) : (
				<div className='bg-white rounded-lg'>
					<div className='p-4 border-b'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
							<Input
								placeholder='Search children...'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className='pl-10 bg-gray-50'
							/>
						</div>
					</div>
					<div className='divide-y divide-gray-100'>
						{filteredChildren.map((child) => (
							<div
								key={child.child_id}
								onClick={() => handleChildClick(child.child_id)}
								className='p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group'
							>
								<div className='flex items-center gap-4'>
									<div className='w-10 h-10 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
										<User className='w-5 h-5 text-[#344e41]' />
									</div>
									<div>
										<h3 className='font-medium text-[#344e41] group-hover:text-[#344e41]/80'>
											{child.first_name} {child.last_name}
										</h3>
										<div className='flex items-center gap-4 text-sm text-muted-foreground'>
											<div className='flex items-center gap-1'>
												<Calendar className='h-3 w-3' />
												<span>{format(new Date(child.birth_date), "MMM d, yyyy")}</span>
											</div>
											<div className='flex items-center gap-1'>
												<User className='h-3 w-3' />
												<span>{child.username}</span>
											</div>
										</div>
									</div>
								</div>
								<div className='flex items-center gap-4'>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
										}`}
									>
										{child.status}
									</span>
									<ChevronRight className='w-5 h-5 text-gray-400 group-hover:text-[#344e41] transition-colors' />
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
