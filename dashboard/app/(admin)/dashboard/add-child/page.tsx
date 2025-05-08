"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Heart} from "lucide-react";
import {toast} from "sonner";
import api from "@/lib/axios";

interface AddChildFormData {
	first_name: string;
	last_name: string;
	birth_date: string;
	nickname: string;
	password: string;
}

export default function AddChildPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<AddChildFormData>({
		first_name: "",
		last_name: "",
		birth_date: "",
		nickname: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setIsLoading(true);

		try {
			await api.post("/children", formData);
			toast.success("Child added successfully", {
				description: "Your child's account has been created",
			});
			router.push("/dashboard/children");
		} catch (error: any) {
			console.error("Error adding child:", error);
			toast.error("Failed to add child", {
				description: error.response?.data?.message || "Please try again later",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className='w-full max-w-[400px] mx-auto'>
			<div className='flex flex-col space-y-6'>
				<div className='flex flex-col space-y-2'>
					<div className='flex items-center gap-2'>
						<Heart className='h-6 w-6 text-rose-500' />
						<span className='text-2xl font-bold text-[#344e41]'>Buddy</span>
					</div>
					<h1 className='text-2xl font-semibold tracking-tight'>Add New Child</h1>
					<p className='text-sm text-muted-foreground'>Enter your child's information to create their account</p>
				</div>

				<Card className='border-none shadow-none'>
					<CardContent className='p-0'>
						<form onSubmit={onSubmit}>
							<div className='grid gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='first_name'>First Name</Label>
									<Input
										id='first_name'
										name='first_name'
										placeholder='Enter first name'
										type='text'
										autoCapitalize='words'
										autoComplete='given-name'
										autoCorrect='off'
										disabled={isLoading}
										required
										className='h-11'
										value={formData.first_name}
										onChange={handleChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='last_name'>Last Name</Label>
									<Input
										id='last_name'
										name='last_name'
										placeholder='Enter last name'
										type='text'
										autoCapitalize='words'
										autoComplete='family-name'
										autoCorrect='off'
										disabled={isLoading}
										required
										className='h-11'
										value={formData.last_name}
										onChange={handleChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='nickname'>Nickname</Label>
									<Input
										id='nickname'
										name='nickname'
										placeholder='Enter nickname'
										type='text'
										autoCapitalize='words'
										autoCorrect='off'
										disabled={isLoading}
										required
										className='h-11'
										value={formData.nickname}
										onChange={handleChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='birth_date'>Birth Date</Label>
									<Input
										id='birth_date'
										name='birth_date'
										type='date'
										disabled={isLoading}
										required
										className='h-11'
										value={formData.birth_date}
										onChange={handleChange}
									/>
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='password'>Password</Label>
									<Input
										id='password'
										name='password'
										type='password'
										placeholder='Enter password'
										autoComplete='new-password'
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
									{isLoading ? "Adding Child..." : "Add Child"}
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter className='p-0 mt-6'>
						<div className='text-sm text-muted-foreground'>
							<Button
								variant='link'
								className='p-0 h-auto font-normal'
								onClick={() => router.back()}
							>
								← Back to Children List
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
