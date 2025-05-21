export function ChildActivityFeed({activity}: {activity: any[]}) {
	return (
		<div className='bg-gray-50 rounded-xl p-4 flex flex-col gap-3'>
			{activity.map((item, i) => (
				<div
					key={i}
					className='flex items-start gap-3'
				>
					<div className='w-8 text-center text-gray-400'>{item.type === "event" ? "🗓️" : item.type === "upload" ? "📄" : "💬"}</div>
					<div className='flex-1'>
						<div className='text-sm font-medium text-gray-800'>{item.text}</div>
						{item.comment && <div className='text-xs text-gray-500 mt-1'>{item.comment}</div>}
						<div className='text-xs text-gray-400 mt-0.5'>{item.date}</div>
					</div>
				</div>
			))}
		</div>
	);
}
