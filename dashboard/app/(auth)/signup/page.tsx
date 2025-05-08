"use client";

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Heart} from "lucide-react";

export default function SignUpPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setIsLoading(true);

		// TODO: Implement actual signup logic here
		setTimeout(() => {
			setIsLoading(false);
			router.push("/dashboard");
		}, 1000);
	}

	return (
		<div className='w-full max-w-[400px]'>
			<div className='flex flex-col space-y-6'>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<Heart className='h-6 w-6 text-rose-500' />
						<span className='text-2xl font-bold text-[#344e41]'>Buddy</span>
					</div>
					<h1 className='text-2xl font-semibold tracking-tight'>Create an account</h1>
					<p className='text-sm text-muted-foreground'>Enter your information to create your account</p>
				</div>

				<Card className='border-none shadow-none'>
					<CardContent className='p-0'>
						<form onSubmit={onSubmit}>
							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='name'>Full Name</Label>
									<Input
										id='name'
										placeholder='John Doe'
										type='text'
										autoCapitalize='words'
										autoComplete='name'
										autoCorrect='off'
										disabled={isLoading}
										required
										className='h-11'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										placeholder='name@example.com'
										type='email'
										autoCapitalize='none'
										autoComplete='email'
										autoCorrect='off'
										disabled={isLoading}
										required
										className='h-11'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='password'>Password</Label>
									<Input
										id='password'
										type='password'
										autoComplete='new-password'
										disabled={isLoading}
										required
										className='h-11'
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='confirmPassword'>Confirm Password</Label>
									<Input
										id='confirmPassword'
										type='password'
										autoComplete='new-password'
										disabled={isLoading}
										required
										className='h-11'
									/>
								</div>
								<Button
									disabled={isLoading}
									className='h-11 mt-2'
								>
									{isLoading ? "Creating account..." : "Create Account"}
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter className='p-0 mt-6'>
						<div className='text-sm text-muted-foreground'>
							Already have an account?{" "}
							<Link
								href='/login'
								className='hover:text-primary underline underline-offset-4'
							>
								Sign in
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
