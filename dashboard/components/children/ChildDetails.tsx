import {Child} from "@/lib/api/children";
import {format} from "date-fns";
import {User, Calendar, Clock} from "lucide-react";

export function ChildDetails({child}: {child: Child}) {
	return (
		<div className='bg-white rounded-2xl shadow p-6 flex flex-col gap-6'>
			<div className='flex items-center gap-4'>
				<div className='w-16 h-16 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
					<span className='text-[#344e41] text-xl font-medium'>
						{child.first_name[0]}
						{child.last_name[0]}
					</span>
				</div>
				<div>
					<div className='text-xl font-bold text-[#344e41]'>
						{child.first_name} {child.last_name}
					</div>
					<div className='text-sm text-gray-500'>{child.nickname}</div>
					<div className='flex items-center gap-2 mt-1'>
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
								child.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
							}`}
						>
							{child.status}
						</span>
					</div>
				</div>
			</div>

			<div className='space-y-4'>
				<div className='flex items-center gap-2 text-gray-600'>
					<Calendar className='w-4 h-4' />
					<span>Born {format(new Date(child.birth_date), "MMMM d, yyyy")}</span>
				</div>
				<div className='flex items-center gap-2 text-gray-600'>
					<Clock className='w-4 h-4' />
					<span>Member since {format(new Date(child.created_at), "MMMM yyyy")}</span>
				</div>
			</div>
		</div>
	);
}
