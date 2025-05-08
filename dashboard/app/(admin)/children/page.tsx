"use client";

import {useEffect, useState} from "react";
import {childrenApi, Child} from "@/lib/api/children";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Plus, User, Calendar, ChevronRight} from "lucide-react";
import {toast} from "sonner";
import Link from "next/link";
import {ChildDetailsDialog} from "@/components/children/child-details-dialog";
import {format} from "date-fns";

export default function ChildrenPage() {
	const [children, setChildren] = useState<Child[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedChild, setSelectedChild] = useState<Child | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

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

	const handleChildClick = (child: Child) => {
		setSelectedChild(child);
		setIsDialogOpen(true);
	};

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
				<Card>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<User className='w-12 h-12 text-gray-400 mb-4' />
						<h3 className='text-lg font-medium text-gray-900 mb-2'>No children added yet</h3>
						<p className='text-gray-500 text-center mb-4'>Start by adding your first child to track their progress and achievements.</p>
						<Link href='/dashboard/add-child'>
							<Button className='bg-[#344e41] hover:bg-[#344e41]/90'>
								<Plus className='w-4 h-4 mr-2' />
								Add Child
							</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{children.map((child) => (
						<Card
							key={child.child_id}
							className='hover:shadow-lg transition-all duration-200 cursor-pointer'
							onClick={() => handleChildClick(child)}
						>
							<CardContent className='p-6'>
								<div className='flex items-start justify-between'>
									<div className='flex items-center gap-4'>
										<div className='w-12 h-12 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
											<User className='w-6 h-6 text-[#344e41]' />
										</div>
										<div>
											<h3 className='font-semibold text-lg text-[#344e41]'>
												{child.first_name} {child.last_name}
											</h3>
											<p className='text-sm text-gray-500'>{child.nickname}</p>
										</div>
									</div>
									<ChevronRight className='w-5 h-5 text-gray-400' />
								</div>
								<div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
									<Calendar className='w-4 h-4' />
									<span>Born {format(new Date(child.birth_date), "MMMM d, yyyy")}</span>
								</div>
								<div className='mt-2'>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
										}`}
									>
										{child.status}
									</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<ChildDetailsDialog
				child={selectedChild}
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</div>
	);
}
