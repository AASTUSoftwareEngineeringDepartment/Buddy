"use client";

import {useState, useRef, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

export default function OTPPage() {
	const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const router = useRouter();

	// Initialize refs array
	useEffect(() => {
		inputRefs.current = inputRefs.current.slice(0, 6);
	}, []);

	const handleChange = (index: number, value: string) => {
		// Only allow numbers
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		// Handle backspace
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);
		if (!/^\d*$/.test(pastedData)) return;

		const newOtp = [...otp];
		pastedData.split("").forEach((digit, index) => {
			if (index < 6) {
				newOtp[index] = digit;
			}
		});
		setOtp(newOtp);

		// Focus the next empty input or the last input
		const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
		if (nextEmptyIndex !== -1) {
			inputRefs.current[nextEmptyIndex]?.focus();
		} else {
			inputRefs.current[5]?.focus();
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const code = otp.join("");
		if (code.length !== 6) {
			toast.error("Please enter a complete 6-digit code");
			return;
		}

		setIsLoading(true);
		try {
			// TODO: Implement your OTP verification logic here
			// const response = await verifyOTP(code);
			// if (response.success) {
			//     router.push("/dashboard");
			// }
			toast.success("OTP verified successfully!");
			router.push("/dashboard");
		} catch (error) {
			toast.error("Invalid OTP code");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] via-[#e9f5ee] to-[#a3b18a] p-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-2xl shadow-xl p-8'>
					{/* Back Button */}
					<Link
						href='/login'
						className='inline-flex items-center text-sm text-gray-600 hover:text-[#344e41] mb-6'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to Login
					</Link>

					{/* Header */}
					<div className='text-center mb-8'>
						<h1 className='text-2xl font-bold text-[#344e41] mb-2'>Enter Verification Code</h1>
						<p className='text-gray-600'>We've sent a 6-digit code to your email. Please enter it below.</p>
					</div>

					{/* OTP Form */}
					<form
						onSubmit={handleSubmit}
						className='space-y-6'
					>
						<div className='flex justify-center gap-2'>
							{otp.map((digit, index) => (
								<input
									key={index}
									ref={(el) => (inputRefs.current[index] = el)}
									type='text'
									maxLength={1}
									value={digit}
									onChange={(e) => handleChange(index, e.target.value)}
									onKeyDown={(e) => handleKeyDown(index, e)}
									onPaste={handlePaste}
									className='w-12 h-12 text-center text-xl font-bold border-2 border-[#e0e4e8] rounded-xl focus:border-[#344e41] focus:ring-2 focus:ring-[#344e41]/20 transition-all'
								/>
							))}
						</div>

						<Button
							type='submit'
							className='w-full bg-[#344e41] text-white hover:bg-[#344e41]/90 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl'
							disabled={isLoading || otp.some((digit) => !digit)}
						>
							{isLoading ? "Verifying..." : "Verify Code"}
						</Button>

						<div className='text-center'>
							<button
								type='button'
								className='text-sm text-[#344e41] hover:text-[#344e41]/80 font-medium'
								onClick={() => {
									// TODO: Implement resend OTP logic
									toast.success("New code sent!");
								}}
							>
								Didn't receive the code? Resend
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
