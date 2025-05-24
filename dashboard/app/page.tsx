"use client";
import {useState} from "react";
import Image from "next/image";
import {Menu, X, User, BookOpen, GraduationCap, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, MessageCircle, Trophy, Star, Users} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

const steps = [
	{
		icon: <User className='w-10 h-10 text-amber-500' />,
		title: "Sign Up",
		desc: "Create your free parent account in seconds and join our learning community.",
	},
	{
		icon: <Users className='w-10 h-10 text-green-500' />,
		title: "Add Your Child",
		desc: "Register your child's profile and customize their learning preferences.",
	},
	{
		icon: <GraduationCap className='w-10 h-10 text-red-500' />,
		title: "Monitor Progress",
		desc: "Track your child's achievements, stories, and learning journey in real-time.",
	},
];

const features = [
	{
		icon: <BookOpen className='w-8 h-8 text-[#344e41]' />,
		title: "Interactive Stories",
		desc: "Engaging stories that adapt to your child's reading level and interests.",
		color: "bg-[#e9f5ee]",
	},
	{
		icon: <MessageCircle className='w-8 h-8 text-[#588157]' />,
		title: "AI-Powered Learning",
		desc: "Personalized learning experience with our smart AI assistant.",
		color: "bg-[#fdf6e3]",
	},
	{
		icon: <Trophy className='w-8 h-8 text-[#b68900]' />,
		title: "Achievement System",
		desc: "Track progress and celebrate milestones with our reward system.",
		color: "bg-[#fbeaea]",
	},
	{
		icon: <Users className='w-8 h-8 text-[#344e41]' />,
		title: "Parent Dashboard",
		desc: "Monitor your child's progress and customize their learning journey.",
		color: "bg-[#e9f5ee]",
	},
];

const testimonials = [
	{
		quote: "My daughter loves the interactive stories and has improved her reading skills significantly!",
		name: "Sarah Johnson",
		role: "Parent",
		avatar: "/avatars/parent1.png",
	},
	{
		quote: "The AI assistant is amazing at keeping my son engaged and motivated to learn.",
		name: "Michael Chen",
		role: "Parent",
		avatar: "/avatars/parent2.png",
	},
	{
		quote: "I love earning stars and seeing my progress! The stories are so much fun!",
		name: "Emma Wilson",
		role: "Student",
		avatar: "/avatars/student1.png",
	},
];

const stats = [
	{
		value: "10K+",
		label: "Active Students",
		icon: <Users className='w-6 h-6 text-[#344e41]' />,
	},
	{
		value: "500+",
		label: "Interactive Stories",
		icon: <BookOpen className='w-6 h-6 text-[#588157]' />,
	},
	{
		value: "95%",
		label: "Parent Satisfaction",
		icon: <Star className='w-6 h-6 text-[#b68900]' />,
	},
	{
		value: "24/7",
		label: "AI Support",
		icon: <MessageCircle className='w-6 h-6 text-[#344e41]' />,
	},
];

export default function Home() {
	const [testimonialIdx, setTestimonialIdx] = useState(0);

	return (
		<div className='min-h-screen bg-gradient-to-b from-white to-[#f5f7fa]'>
			{/* Hero Section */}
			<section className='relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#a3b18a] via-[#e9f5ee] to-[#f5f7fa] overflow-hidden'>
				{/* Grid Pattern */}
				<div className='absolute inset-0 bg-[linear-gradient(to_right,#344e41_1px,transparent_1px),linear-gradient(to_bottom,#344e41_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]'></div>

				{/* Animated gradient overlay */}
				<div className='absolute inset-0 bg-gradient-to-b from-transparent via-[#e9f5ee]/50 to-white/50'></div>

				<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
						{/* Left Content */}
						<div className='text-left'>
							<div className='inline-block mb-6'>
								<span className='inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-[#344e41] text-sm font-medium shadow-sm'>
									<span className='w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse'></span>
									Trusted by 10,000+ Parents
								</span>
							</div>

							<h1 className='text-4xl md:text-6xl font-extrabold text-[#344e41] mb-6 leading-tight'>
								Empowering Kids to{" "}
								<span className='relative inline-block'>
									Learn & Grow
									<svg
										className='absolute -bottom-2 left-0 w-full'
										height='8'
										viewBox='0 0 200 8'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M0 4C50 4 50 1 100 1C150 1 150 7 200 7'
											stroke='#588157'
											strokeWidth='2'
											strokeLinecap='round'
										/>
									</svg>
								</span>
							</h1>

							<p className='text-xl md:text-2xl text-[#588157] mb-8 max-w-2xl leading-relaxed'>
								Interactive stories, personalized learning, and AI-powered support for your child's educational journey.
							</p>

							<div className='flex flex-col sm:flex-row gap-4 mb-12'>
								<Button className='group bg-[#344e41] text-white hover:bg-[#344e41]/90 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl'>
									Get Started
									<ArrowRight className='ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1' />
								</Button>
								<Button
									variant='outline'
									className='group border-2 border-[#344e41] text-[#344e41] hover:bg-[#344e41]/10 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl'
								>
									Learn More
									<ChevronRight className='ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1' />
								</Button>
							</div>
						</div>

						{/* Right Content - Mascot Image */}
						<div className='relative flex justify-center lg:justify-end'>
							<div className='relative'>
								<div className='absolute inset-0 bg-gradient-to-r from-[#344e41]/20 to-[#588157]/20 rounded-full blur-2xl transform -translate-y-4'></div>
								<Image
									src='/images/puppet.png'
									alt='Learning Mascot'
									width={400}
									height={400}
									className='relative animate-bounce-slow'
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-white'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-[#344e41] mb-4'>Why Choose Us?</h2>
						<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
							Our platform combines cutting-edge technology with proven educational methods to create an engaging learning experience.
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{features.map((feature, idx) => (
							<Card
								key={idx}
								className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${feature.color}`}
							>
								<div className='mb-4'>{feature.icon}</div>
								<h3 className='text-xl font-bold text-[#344e41] mb-2'>{feature.title}</h3>
								<p className='text-gray-600'>{feature.desc}</p>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='py-20 bg-gradient-to-br from-[#f5f7fa] via-[#e9f5ee] to-[#a3b18a]'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-[#344e41] mb-4'>How It Works</h2>
						<p className='text-lg text-[#588157] max-w-2xl mx-auto'>
							Getting started is easy! Follow these simple steps to begin your child's learning journey.
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{steps.map((step, idx) => (
							<div
								key={idx}
								className='relative'
							>
								<div className='bg-white rounded-2xl p-8 shadow-lg h-full'>
									<div className='mb-4'>{step.icon}</div>
									<h3 className='text-xl font-bold text-[#344e41] mb-2'>{step.title}</h3>
									<p className='text-gray-600'>{step.desc}</p>
								</div>
								{idx < steps.length - 1 && (
									<div className='hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2'>
										<ArrowRight className='w-8 h-8 text-[#344e41]' />
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className='py-20 bg-white'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center mb-16'>
						<h2 className='text-3xl md:text-4xl font-bold text-[#344e41] mb-4'>What Parents Say</h2>
						<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
							Join thousands of satisfied parents who have transformed their children's learning experience.
						</p>
					</div>
					<div className='relative max-w-3xl mx-auto'>
						<div className='bg-gradient-to-r from-[#344e41] to-[#588157] rounded-3xl p-10 text-white shadow-2xl'>
							<div className='flex-1 max-w-md mx-auto'>
								<div className='font-inter text-lg text-white/90 italic text-center mb-6'>"{testimonials[testimonialIdx].quote}"</div>
								<div className='flex items-center justify-center gap-3'>
									<Image
										src={testimonials[testimonialIdx].avatar}
										alt={testimonials[testimonialIdx].name}
										width={48}
										height={48}
										className='rounded-full'
									/>
									<div>
										<div className='font-semibold'>{testimonials[testimonialIdx].name}</div>
										<div className='text-sm text-white/70'>{testimonials[testimonialIdx].role}</div>
									</div>
								</div>
							</div>
						</div>
						<div className='flex justify-center gap-2 mt-6'>
							<Button
								variant='outline'
								size='icon'
								onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
								className='rounded-full'
							>
								<ChevronLeft className='w-4 h-4' />
							</Button>
							<Button
								variant='outline'
								size='icon'
								onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
								className='rounded-full'
							>
								<ChevronRight className='w-4 h-4' />
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-20 bg-gradient-to-br from-[#a3b18a] via-[#e9f5ee] to-[#f5f7fa]'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
						{stats.map((stat, idx) => (
							<div
								key={idx}
								className='bg-white/80 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg'
							>
								<div className='flex justify-center mb-4'>{stat.icon}</div>
								<div className='text-3xl font-bold text-[#344e41] mb-2'>{stat.value}</div>
								<div className='text-gray-600'>{stat.label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 bg-white'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='bg-gradient-to-r from-[#344e41] to-[#588157] rounded-3xl p-12 text-center text-white shadow-2xl'>
						<h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Start Your Child's Learning Journey?</h2>
						<p className='text-lg text-white/90 mb-8 max-w-2xl mx-auto'>
							Join thousands of parents who are already using our platform to enhance their children's education.
						</p>
						<Button className='bg-white text-[#344e41] hover:bg-white/90 px-8 py-6 text-lg rounded-xl'>
							Get Started Now <ArrowRight className='ml-2 w-5 h-5' />
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='bg-[#344e41] text-white py-12'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
						<div>
							<h3 className='text-xl font-bold mb-4'>GuadeKids.com</h3>
							<p className='text-white/70'>Empowering Kids to Learn & Grow</p>
						</div>
						<div>
							<h4 className='font-semibold mb-4'>Quick Links</h4>
							<ul className='space-y-2'>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Features
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Pricing
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-4'>Support</h4>
							<ul className='space-y-2'>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Help Center
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Contact Us
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										FAQ
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='font-semibold mb-4'>Legal</h4>
							<ul className='space-y-2'>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white'
									>
										Terms of Service
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t border-white/10 mt-12 pt-8 text-center text-white/70'>
						<p>© 2024 GuadeKids.com. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
