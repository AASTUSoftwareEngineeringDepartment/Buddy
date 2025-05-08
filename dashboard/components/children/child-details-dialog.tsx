"use client";

import {Child} from "@/lib/api/children";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import {format} from "date-fns";

interface ChildDetailsDialogProps {
	child: Child | null;
	isOpen: boolean;
	onClose: () => void;
}

export function ChildDetailsDialog({child, isOpen, onClose}: ChildDetailsDialogProps) {
	if (!child) return null;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold text-[#344e41]'>
						{child.first_name} {child.last_name}
					</DialogTitle>
					<DialogDescription>Detailed information about {child.nickname}</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='space-y-2'>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Full Name</span>
							<span className='text-sm font-medium'>
								{child.first_name} {child.last_name}
							</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Nickname</span>
							<span className='text-sm font-medium'>{child.nickname}</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Username</span>
							<span className='text-sm font-medium'>{child.username}</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Birth Date</span>
							<span className='text-sm font-medium'>{format(new Date(child.birth_date), "MMMM d, yyyy")}</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Status</span>
							<span className={`text-sm font-medium ${child.status === "Active" ? "text-green-600" : "text-red-600"}`}>{child.status}</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm font-medium text-gray-500'>Created At</span>
							<span className='text-sm font-medium'>{format(new Date(child.created_at), "MMMM d, yyyy")}</span>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
