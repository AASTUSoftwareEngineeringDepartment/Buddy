import Link from "next/link";
import {Button} from "@/components/ui/button";
import {UserPlus, Sparkles, Star, Users} from "lucide-react";

export function AddChildCard() {
	return (
		<div className='rounded-3xl bg-gradient-to-tr from-[#a3b18a] via-[#588157] to-[#344e41] shadow-2xl p-8 flex flex-col items-center text-center relative overflow-hidden min-h-[200px]'>
			<div className='absolute -top-6 -left-6 opacity-30 text-white'>
				<Sparkles className='w-24 h-24' />
			</div>
			<div className='absolute -bottom-8 -right-8 opacity-20 text-white'>
				<Star className='w-32 h-32' />
			</div>
			<div className='flex items-center justify-center mb-4 z-10'>
				<Users className='w-14 h-14 text-white drop-shadow-lg' />
			</div>
			<div className='font-extrabold text-3xl text-white mb-2 z-10'>Register your child</div>
			<div className='text-sm text-white/90 mb-6 z-10 max-w-md'>
				Unlock a world of learning, fun, and achievement! <br />
				<span className='text-xs text-white/70'>
					Add your child to track their progress, celebrate milestones, and help them grow every day. Registration is quick and easy!
				</span>
			</div>
			<Link
				href='/dashboard/add-child'
				className='z-10'
			>
				<Button className='bg-white text-[#344e41] hover:bg-[#a3b18a]/90 text-lg px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2'>
					<UserPlus className='w-5 h-5' /> Add Child
				</Button>
			</Link>
		</div>
	);
}
