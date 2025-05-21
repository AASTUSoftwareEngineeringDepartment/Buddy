import {ReactNode} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

interface AnnouncementCardProps {
	title: string;
	description: string;
	icon: ReactNode;
	primaryButton?: {text: string; onClick?: () => void; icon?: ReactNode};
	secondaryButton?: {text: string; href: string};
	gradient?: string;
	titleClassName?: string;
	descriptionClassName?: string;
}

export function AnnouncementCard({
	title,
	description,
	icon,
	primaryButton,
	secondaryButton,
	gradient = "linear-gradient(90deg, #344e41 0%, #588157 60%, #a3b18a 100%)",
	titleClassName = "font-extrabold text-3xl mb-2 drop-shadow-lg",
	descriptionClassName = "text-lg opacity-95 font-medium max-w-2xl drop-shadow-md",
}: AnnouncementCardProps) {
	return (
		<div
			className='rounded-3xl p-10 mb-8 flex flex-col md:flex-row items-center justify-between shadow-2xl min-h-[220px]'
			style={{background: gradient, color: "white"}}
		>
			<div className='flex items-center gap-6 flex-1 w-full'>
				<div className='flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-white/20'>{icon}</div>
				<div>
					<div className={titleClassName}>{title}</div>
					<div className={descriptionClassName}>{description}</div>
				</div>
			</div>
			<div className='flex flex-col md:flex-row gap-4 mt-8 md:mt-0 md:ml-8'>
				{primaryButton && (
					<Button
						size='lg'
						className='bg-white text-[#344e41] hover:bg-[#a3b18a]/80 font-bold text-lg px-8 py-4 shadow-lg border-2 border-white'
						variant='outline'
						onClick={primaryButton.onClick}
					>
						{primaryButton.text}
						{primaryButton.icon && <span className='ml-2'>{primaryButton.icon}</span>}
					</Button>
				)}
				{secondaryButton && (
					<Link
						href={secondaryButton.href}
						passHref
					>
						<Button
							size='lg'
							className='bg-gradient-to-r from-[#344e41] to-[#a3b18a] text-white font-bold text-lg px-8 py-4 shadow-lg border-2 border-white hover:from-[#344e41]/90 hover:to-[#a3b18a]/90'
							variant='ghost'
						>
							{secondaryButton.text} <span className='ml-2'>↗</span>
						</Button>
					</Link>
				)}
			</div>
		</div>
	);
}
