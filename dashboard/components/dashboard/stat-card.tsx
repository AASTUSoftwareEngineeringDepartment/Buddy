import {ReactNode} from "react";

export function StatCard({
	icon,
	label,
	value,
	color = "bg-secondary",
	iconColor = "text-primary",
}: {
	icon: ReactNode;
	label: string;
	value: string | number;
	color?: string;
	iconColor?: string;
}) {
	return (
		<div className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm ${color}`}>
			<div className={`rounded-xl p-3 bg-card shadow ${iconColor}`}>{icon}</div>
			<div>
				<div className='text-2xl font-bold text-card-foreground'>{value}</div>
				<div className='text-base text-muted-foreground font-medium'>{label}</div>
			</div>
		</div>
	);
}
