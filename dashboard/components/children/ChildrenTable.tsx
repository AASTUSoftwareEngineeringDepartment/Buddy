import {Child} from "@/lib/api/children";
import {UserPlus} from "lucide-react";

export function ChildrenTable({children}: {children: Child[]}) {
	const totalRows = 10;
	const placeholders = Math.max(0, totalRows - children.length);
	return (
		<table className='w-full text-left'>
			<thead>
				<tr className='text-gray-500 text-sm'>
					<th className='py-2 px-3 font-semibold'>#</th>
					<th className='py-2 px-3 font-semibold'>Initials</th>
					<th className='py-2 px-3 font-semibold'>Name</th>
					<th className='py-2 px-3 font-semibold'>Nickname</th>
					<th className='py-2 px-3 font-semibold'>Status</th>
				</tr>
			</thead>
			<tbody>
				{children.map((child, idx) => (
					<tr
						key={child.child_id}
						className={`transition hover:bg-[#e9f5ee] ${idx !== totalRows - 1 ? "border-b border-[#e0e4e8]" : ""}`}
					>
						<td className='py-3 px-3 font-semibold text-[#344e41]'>{idx + 1}</td>
						<td className='py-3 px-3'>
							<div className='w-9 h-9 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
								<span className='text-[#344e41] font-bold text-lg'>
									{child.first_name[0]}
									{child.last_name[0]}
								</span>
							</div>
						</td>
						<td className='py-3 px-3 font-medium text-[#344e41]'>
							{child.first_name} {child.last_name}
						</td>
						<td className='py-3 px-3 text-gray-500'>{child.nickname}</td>
						<td className='py-3 px-3'>
							<span
								className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
									child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
								}`}
							>
								{child.status}
							</span>
						</td>
					</tr>
				))}
				{Array.from({length: placeholders}).map((_, idx) => (
					<tr
						key={`placeholder-${idx}`}
						className={`opacity-80 bg-white/60 border-b border-dashed border-[#b0b7b1]`}
					>
						<td className='py-3 px-3 font-semibold text-[#b0b7b1]'>{children.length + idx + 1}</td>
						<td className='py-3 px-3'>
							<div className='w-9 h-9 rounded-full border-2 border-dashed border-[#b0b7b1] flex items-center justify-center bg-gray-50'>
								<UserPlus className='w-5 h-5 text-[#b0b7b1]' />
							</div>
						</td>
						<td className='py-3 px-3 font-medium text-gray-400 italic'>Available Slot</td>
						<td className='py-3 px-3 text-gray-300'>—</td>
						<td className='py-3 px-3'>
							<span className='inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 border border-dashed border-gray-300'>
								Add a child
							</span>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
