import {Button} from "@/components/ui/button";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import React from "react";

interface EditChildModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	form: {
		first_name: string;
		last_name: string;
		nickname: string;
	};
	handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditChildModal({open, onOpenChange, onSubmit, onCancel, form, handleFormChange}: EditChildModalProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<form
					className='bg-white rounded-2xl w-full max-w-md  space-y-4'
					onSubmit={onSubmit}
				>
					<div className='text-xl font-bold mb-2'>Edit Child Profile</div>
					<label
						htmlFor='first_name'
						className='block text-sm font-medium text-gray-700'
					>
						First Name
					</label>
					<Input
						id='first_name'
						name='first_name'
						value={form.first_name}
						onChange={handleFormChange}
						required
					/>
					<label
						htmlFor='last_name'
						className='block text-sm font-medium text-gray-700'
					>
						Last Name
					</label>
					<Input
						id='last_name'
						name='last_name'
						value={form.last_name}
						onChange={handleFormChange}
						required
					/>
					<label
						htmlFor='nickname'
						className='block text-sm font-medium text-gray-700'
					>
						Nickname
					</label>
					<Input
						id='nickname'
						name='nickname'
						value={form.nickname}
						onChange={handleFormChange}
					/>
					<div className='flex gap-4 mt-4'>
						<Button
							type='submit'
							className='bg-[#344e41] text-white'
						>
							Save
						</Button>
						<Button
							type='button'
							variant='outline'
							onClick={onCancel}
						>
							Cancel
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
