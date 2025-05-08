"use client";

import {useState, useEffect, Suspense} from "react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Heart} from "lucide-react";
import {useAuth} from "@/lib/context/auth-context";

function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const {login, user, isLoading: authLoading} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setIsLoading(true);

		try {
			await login(formData.username, formData.password);
			// Get the redirect path from URL params or default to dashboard
			const from = searchParams.get("from") || "/dashboard";
			router.push(from);
		} catch (error) {
			// Error is already handled in the auth context
			console.error("Login error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Check if already logged in
	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	if (authLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41]'></div>
			</div>
		);
	}

	return (
		<Card className='border-none shadow-none'>
			<CardContent className='p-0'>
				<form onSubmit={onSubmit}>
					<div className='grid gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='username'>Username</Label>
							<Input
								id='username'
								name='username'
								placeholder='Enter your username'
								type='text'
								autoCapitalize='none'
								autoComplete='username'
								autoCorrect='off'
								disabled={isLoading}
								required
								className='h-11'
								value={formData.username}
								onChange={handleChange}
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								name='password'
								type='password'
								autoComplete='current-password'
								disabled={isLoading}
								required
								className='h-11'
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
						<Button
							disabled={isLoading}
							className='h-11 mt-2'
						>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className='flex flex-col space-y-4 p-0 mt-6'>
				<div className='text-sm text-muted-foreground'>
					<Link
						href='/forgot-password'
						className='hover:text-primary underline underline-offset-4'
					>
						Forgot your password?
					</Link>
				</div>
				<div className='text-sm text-muted-foreground'>
					Don't have an account?{" "}
					<Link
						href='/signup'
						className='hover:text-primary underline underline-offset-4'
					>
						Sign up
					</Link>
				</div>
			</CardFooter>
		</Card>
	);
}

export default function LoginPage() {
	return (
		<div className='w-full max-w-[400px]'>
			<div className='flex flex-col space-y-6'>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<Heart className='h-6 w-6 text-rose-500' />
						<span className='text-2xl font-bold text-[#344e41]'>Buddy</span>
					</div>
					<h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
					<p className='text-sm text-muted-foreground'>Enter your credentials to sign in to your account</p>
				</div>

				<Suspense
					fallback={
						<div className='flex items-center justify-center min-h-[400px]'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#344e41]'></div>
						</div>
					}
				>
					<LoginForm />
				</Suspense>
			</div>
		</div>
	);
}
