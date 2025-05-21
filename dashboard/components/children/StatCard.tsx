import {ReactNode} from "react";

export function StatCard({label, value, icon}: {label: string; value: ReactNode; icon?: ReactNode}) {
	return (
		<div className='rounded-2xl bg-white/40 backdrop-blur-md shadow p-6 flex items-center gap-4 border border-white/30'>
			{icon && <div className='w-10 h-10 flex items-center justify-center rounded-full bg-[#e9f5ee] text-[#344e41]'>{icon}</div>}
			<div>
				<div className='text-sm text-gray-500 font-medium mb-1'>{label}</div>
				<div className='text-2xl font-bold text-[#344e41]'>{value}</div>
			</div>
		</div>
	);
}
