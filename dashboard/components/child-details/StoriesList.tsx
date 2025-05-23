import React from "react";
import {Image} from "lucide-react";

export function StoriesList({stories}: {stories: {title: string; date: string}[]}) {
	return (
		<div>
			<div className='text-lg font-bold text-[#344e41] mb-3 flex items-center gap-2'>Stories</div>
			<div className='overflow-x-auto'>
				<table className='min-w-full bg-white rounded-2xl shadow border border-[#e0e4e8]'>
					<thead>
						<tr className='text-[#344e41] text-sm font-semibold bg-[#e9f5ee]'>
							<th className='py-3 px-4 text-left rounded-tl-2xl'>Image</th>
							<th className='py-3 px-4 text-left'>Title</th>
							<th className='py-3 px-4 text-left rounded-tr-2xl'>Date</th>
						</tr>
					</thead>
					<tbody>
						{stories.length === 0 ? (
							<tr>
								<td
									colSpan={3}
									className='py-6 px-4 text-center text-gray-400 italic'
								>
									No stories yet.
								</td>
							</tr>
						) : (
							stories.map((story, idx) => (
								<tr
									key={idx}
									className='border-t border-[#e0e4e8] hover:bg-[#f7fafc] transition'
								>
									<td className='py-3 px-4'>
										<div className='w-12 h-12 bg-[#e0e4e8] rounded-xl flex items-center justify-center'>
											<Image className='w-6 h-6 text-gray-400' />
										</div>
									</td>
									<td className='py-3 px-4 font-medium text-[#344e41]'>{story.title}</td>
									<td className='py-3 px-4 text-gray-500 text-sm'>{story.date}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
