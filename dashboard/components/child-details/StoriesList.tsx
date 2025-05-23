import React, {useEffect, useState} from "react";
import {BookOpen, ChevronLeft, ChevronRight, X, Send, Trash2} from "lucide-react";
import {childrenApi, Story} from "@/lib/api/children";
import {useParams} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";

export function StoriesList() {
	const params = useParams();
	const [stories, setStories] = useState<Story[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [skip, setSkip] = useState(0);
	const [selectedStory, setSelectedStory] = useState<Story | null>(null);
	const [comment, setComment] = useState("");
	const [updating, setUpdating] = useState(false);
	const [action, setAction] = useState<"view" | "update" | "delete">("view");
	const limit = 3;

	const gradients = ["from-[#344e41] to-[#588157]", "from-[#588157] to-[#a3b18a]", "from-[#344e41] to-[#a3b18a]", "from-[#588157] to-[#344e41]"];

	const fetchStories = async (newSkip: number) => {
		try {
			setLoading(true);
			const data = await childrenApi.getChildStories(params.id as string, limit, newSkip);
			setStories(data.stories);
			setTotal(data.total);
			setSkip(newSkip);
		} catch (error) {
			console.error("Error fetching stories:", error);
			toast.error("Failed to load stories", {
				description: "Please try again later",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStories(0);
	}, [params.id]);

	const handlePrevious = () => {
		if (skip > 0) {
			fetchStories(skip - limit);
		}
	};

	const handleNext = () => {
		if (skip + limit < total) {
			fetchStories(skip + limit);
		}
	};

	const handleUpdateStory = async () => {
		if (!selectedStory || !comment.trim()) return;

		try {
			setUpdating(true);
			const updatedStory = await childrenApi.updateStory(selectedStory.story_id, {
				parent_comment: comment,
				story_id: selectedStory.story_id,
				child_id: params.id as string,
			});
			setSelectedStory(updatedStory);
			setComment("");
			toast.success("Story updated successfully");
		} catch (error) {
			console.error("Error updating story:", error);
			toast.error("Failed to update story");
		} finally {
			setUpdating(false);
		}
	};

	const handleDeleteStory = async () => {
		if (!selectedStory) return;

		try {
			await childrenApi.deleteStory(params.id as string, selectedStory.story_id);
			setSelectedStory(null);
			// Refresh the stories list
			fetchStories(skip);
			toast.success("Story deleted successfully");
		} catch (error) {
			console.error("Error deleting story:", error);
			toast.error("Failed to delete story");
		}
	};

	const formatStoryBody = (body: string) => {
		return body
			.split("\n")
			.map((paragraph) => {
				// Replace markdown bold with strong tags
				let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
				// Replace markdown italic with em tags
				formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
				return formatted;
			})
			.join("\n");
	};

	if (loading && stories.length === 0) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center gap-2'>
					<BookOpen className='w-6 h-6 text-[#344e41]' />
					<h2 className='text-2xl font-bold text-[#344e41]'>Stories</h2>
				</div>
				<div className='text-center py-12 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41] mx-auto'></div>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<BookOpen className='w-6 h-6 text-[#344e41]' />
					<h2 className='text-2xl font-bold text-[#344e41]'>Stories</h2>
				</div>
				{total > limit && (
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={handlePrevious}
							disabled={skip === 0 || loading}
							className='bg-white/40 backdrop-blur-md'
						>
							<ChevronLeft className='w-4 h-4' />
						</Button>
						<span className='text-sm text-[#344e41]'>
							{skip + 1}-{Math.min(skip + limit, total)} of {total}
						</span>
						<Button
							variant='outline'
							size='sm'
							onClick={handleNext}
							disabled={skip + limit >= total || loading}
							className='bg-white/40 backdrop-blur-md'
						>
							<ChevronRight className='w-4 h-4' />
						</Button>
					</div>
				)}
			</div>

			{stories.length === 0 ? (
				<div className='text-center py-12 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30'>
					<BookOpen className='w-12 h-12 text-gray-400 mx-auto mb-4' />
					<p className='text-gray-500 text-lg'>No stories yet</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{stories.map((story, idx) => (
						<div
							key={story.story_id}
							className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${
								gradients[idx % gradients.length]
							} p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
						>
							<div className='absolute inset-0 bg-black/10 backdrop-blur-[2px]' />
							<div className='relative z-10'>
								<h3 className='text-xl font-bold mb-3 line-clamp-2'>{story.title}</h3>
								<p
									className='text-white/80 text-sm line-clamp-4 mb-4'
									dangerouslySetInnerHTML={{__html: formatStoryBody(story.story_body)}}
								/>
								<div className='flex items-center justify-between'>
									<button
										onClick={() => setSelectedStory(story)}
										className='px-3 py-1 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors'
									>
										Read Story
									</button>
									<span className='text-xs text-white/60'>{new Date().toLocaleDateString()}</span>
								</div>
							</div>
							<div className='absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-300' />
						</div>
					))}
				</div>
			)}

			<Dialog
				open={!!selectedStory}
				onOpenChange={(open) => !open && setSelectedStory(null)}
			>
				<DialogContent className='max-w-3xl bg-white rounded-2xl p-0 overflow-hidden'>
					{selectedStory && (
						<div className='relative'>
							<div className='relative w-full h-64 md:h-80'>
								<Image
									src={selectedStory.image_url || "/images/story-bg.png"}
									alt={selectedStory.title}
									fill
									className='object-cover'
								/>
							</div>
							<div className='p-6 md:p-8'>
								<div className='flex items-start justify-between gap-4 mb-4'>
									<h2 className='text-2xl font-bold text-[#344e41]'>{selectedStory.title}</h2>
									<div className='flex items-center gap-2'>
										<button
											onClick={() => setSelectedStory(null)}
											className='p-2 hover:bg-gray-100 rounded-full transition-colors'
										>
											<X className='w-5 h-5 text-gray-500' />
										</button>
									</div>
								</div>
								<div
									className='prose prose-lg max-w-none text-gray-600 mb-8'
									dangerouslySetInnerHTML={{__html: formatStoryBody(selectedStory.story_body)}}
								/>

								{action === "view" && (
									<div className='border-t pt-4'>
										<div className='flex items-center justify-center gap-4'>
											<Button
												onClick={() => setAction("update")}
												className='flex-1 bg-[#344e41] hover:bg-[#344e41]/90'
											>
												<Send className='w-4 h-4 mr-2' />
												Update Story
											</Button>
											<Button
												onClick={() => setAction("delete")}
												variant='destructive'
												className='flex-1'
											>
												<Trash2 className='w-4 h-4 mr-2' />
												Delete Story
											</Button>
										</div>
									</div>
								)}

								{action === "update" && (
									<div className='border-t pt-4'>
										<div className='space-y-4'>
											<div className='text-sm text-gray-500'>
												Provide feedback to improve this story. Your suggestions will help make it more educational and engaging.
											</div>
											<div className='flex items-end gap-2'>
												<Textarea
													placeholder='Add your feedback or suggestions...'
													value={comment}
													onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
													className='min-h-[100px] resize-none'
												/>
												<div className='flex flex-col gap-2'>
													<Button
														onClick={handleUpdateStory}
														disabled={!comment.trim() || updating}
														className='h-[50px] px-4'
													>
														<Send className='w-5 h-5' />
													</Button>
													<Button
														variant='outline'
														onClick={() => {
															setAction("view");
															setComment("");
														}}
														className='h-[50px] px-4'
													>
														Cancel
													</Button>
												</div>
											</div>
										</div>
									</div>
								)}

								{action === "delete" && (
									<div className='border-t pt-4'>
										<div className='space-y-4'>
											<div className='bg-red-50 p-4 rounded-lg'>
												<h3 className='text-lg font-semibold text-red-700 mb-2'>Delete Story</h3>
												<p className='text-red-600 mb-4'>Are you sure you want to delete this story? This action cannot be undone.</p>
												<p className='text-sm text-red-500'>
													Please consider if the story contains inappropriate content or if it's not suitable for children.
												</p>
											</div>
											<div className='flex items-center justify-center gap-4'>
												<Button
													onClick={handleDeleteStory}
													variant='destructive'
													className='flex-1'
												>
													<Trash2 className='w-4 h-4 mr-2' />
													Yes, Delete Story
												</Button>
												<Button
													variant='outline'
													onClick={() => setAction("view")}
													className='flex-1'
												>
													Cancel
												</Button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
