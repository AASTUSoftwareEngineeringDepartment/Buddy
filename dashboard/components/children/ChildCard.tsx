import {Child} from "@/lib/api/children";

export function ChildCard({child, selected, onClick}: {child: Child; selected: boolean; onClick: () => void}) {
	return (
		<div
			className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition ${
				selected ? "bg-primary/10 border-primary" : "hover:bg-muted border-transparent"
			}`}
			onClick={onClick}
		>
			<div className='w-10 h-10 rounded-full bg-[#344e41]/10 flex items-center justify-center'>
				<span className='text-[#344e41] font-medium'>
					{child.first_name[0]}
					{child.last_name[0]}
				</span>
			</div>
			<div className='flex-1 min-w-0'>
				<div className='font-medium text-sm truncate'>
					{child.first_name} {child.last_name}
				</div>
				<div className='text-xs text-gray-500 truncate'>{child.nickname}</div>
			</div>
			<span className={`text-xs px-2 py-0.5 rounded-full ${child.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
				{child.status}
			</span>
		</div>
	);
}
