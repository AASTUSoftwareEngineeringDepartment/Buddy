import {Button} from "@/components/ui/button";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import React from "react";

function TagInput({label, value, onChange, id}: {label: string; value: string[]; onChange: (tags: string[]) => void; id: string}) {
	const [input, setInput] = React.useState("");

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if ((e.key === "Enter" || e.key === ",") && input.trim()) {
			e.preventDefault();
			if (!value.includes(input.trim())) {
				onChange([...value, input.trim()]);
			}
			setInput("");
		} else if (e.key === "Backspace" && !input && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	const removeTag = (idx: number) => {
		onChange(value.filter((_, i) => i !== idx));
	};

	return (
		<div>
			<label
				htmlFor={id}
				className='block text-sm font-medium text-gray-700 mb-1'
			>
				{label}
			</label>
			<div className='flex flex-wrap gap-2 mb-1'>
				{value.map((tag, idx) => (
					<span
						key={idx}
						className='inline-flex items-center bg-[#e9f5ee] text-[#344e41] rounded-full px-3 py-1 text-sm font-medium'
					>
						{tag}
						<button
							type='button'
							className='ml-2 text-[#b94a48] hover:text-red-600'
							onClick={() => removeTag(idx)}
							aria-label='Remove tag'
						>
							×
						</button>
					</span>
				))}
			</div>
			<Input
				id={id}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder='Type and press Enter'
				autoComplete='off'
			/>
		</div>
	);
}

interface ChildSettingsForm {
	favorite_animal: string;
	favorite_character: string;
	screen_time: number;
	preferences: string[];
	themes: string[];
	moral_values: string[];
}

interface ChildSettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	form: ChildSettingsForm;
	handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleTagsChange: (field: "preferences" | "themes" | "moral_values", tags: string[]) => void;
}

export function ChildSettingsModal({open, onOpenChange, onSubmit, onCancel, form, handleFormChange, handleTagsChange}: ChildSettingsModalProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<form
					className='bg-white rounded-2xl  w-full max-w-md  space-y-4'
					onSubmit={onSubmit}
				>
					<div className='text-xl font-bold mb-2'>Child Settings</div>
					<label
						htmlFor='favorite_animal'
						className='block text-sm font-medium text-gray-700'
					>
						Favorite Animal
					</label>
					<Input
						id='favorite_animal'
						name='favorite_animal'
						value={form.favorite_animal}
						onChange={handleFormChange}
					/>
					<label
						htmlFor='favorite_character'
						className='block text-sm font-medium text-gray-700'
					>
						Favorite Character
					</label>
					<Input
						id='favorite_character'
						name='favorite_character'
						value={form.favorite_character}
						onChange={handleFormChange}
					/>
					<label
						htmlFor='screen_time'
						className='block text-sm font-medium text-gray-700'
					>
						Screen Time (minutes)
					</label>
					<Input
						id='screen_time'
						name='screen_time'
						type='number'
						value={form.screen_time}
						onChange={handleFormChange}
						min={0}
					/>
					<TagInput
						label='Preferences'
						id='preferences'
						value={form.preferences}
						onChange={(tags) => handleTagsChange("preferences", tags)}
					/>
					<TagInput
						label='Themes'
						id='themes'
						value={form.themes}
						onChange={(tags) => handleTagsChange("themes", tags)}
					/>
					<TagInput
						label='Moral Values'
						id='moral_values'
						value={form.moral_values}
						onChange={(tags) => handleTagsChange("moral_values", tags)}
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
