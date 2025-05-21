export function ChildProgressSteps({steps}: {steps: any[]}) {
	return (
		<div className='flex gap-4'>
			{steps.map((step, i) => (
				<div
					key={i}
					className='flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 flex flex-col items-center'
				>
					<div className='text-lg font-bold mb-1'>
						{step.value} <span className='text-xs font-normal'>{step.status}</span>
					</div>
					<div className='text-sm text-gray-700'>
						{i + 1}. {step.label}
					</div>
				</div>
			))}
		</div>
	);
}
