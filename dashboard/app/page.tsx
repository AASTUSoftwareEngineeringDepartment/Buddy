"use client";
import {useState} from "react";
import Image from "next/image";
import Link from 'next/link';
import {
	Menu,
	X,
	User,
	BookOpen,
	GraduationCap,
	ArrowRight,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	MessageCircle,
	Trophy,
	Star,
	Users,
	Wand2,
	BarChart2,
	Heart,
	Bot,
} from "lucide-react";
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
		icon: <BookOpen className='w-7 h-7' />,
		title: "Interactive Stories",
		desc: "Engaging stories that adapt to your child's reading level and interests, making learning fun and personalized.",
		color: "from-[#344e41] to-[#588157]",
		highlight: "500+ Stories",
		stats: {
			label: "Stories Available",
			value: "500+",
		},
	},
	{
		icon: <Wand2 className='w-7 h-7' />,
		title: "AI-Powered Learning",
		desc: "Our advanced AI technology personalizes the learning experience and provides real-time feedback.",
		color: "from-[#588157] to-[#a3b18a]",
		highlight: "95% Success",
		stats: {
			label: "Success Rate",
			value: "95%",
		},
	},
	{
		icon: <Trophy className='w-7 h-7' />,
		title: "Achievement System",
		desc: "Motivating rewards and achievements that encourage continuous learning and progress tracking.",
		color: "from-[#344e41] to-[#a3b18a]",
		highlight: "10K+ Users",
		stats: {
			label: "Active Users",
			value: "10K+",
		},
	},
	{
		icon: <BarChart2 className='w-7 h-7' />,
		title: "Parent Dashboard",
		desc: "Comprehensive insights and progress reports to help you track and support your child's learning journey.",
		color: "from-[#588157] to-[#344e41]",
		highlight: "98% Satisfaction",
		stats: {
			label: "Parent Satisfaction",
			value: "98%",
		},
	},
];

const testimonials = [
	{
		quote: "My daughter loves the interactive stories and has improved her reading skills significantly. The AI-powered learning makes it fun and engaging!",
		author: "Sarah Johnson",
		role: "Mother of 8-year-old",
		avatar: "/avatars/parent1.png",
		rating: 5,
		highlight: "Reading Skills Improved",
	},
	{
		quote: "The achievement system keeps my son motivated, and I love being able to track his progress through the parent dashboard. Highly recommended!",
		author: "Michael Chen",
		role: "Father of 7-year-old",
		avatar: "/avatars/parent2.png",
		rating: 5,
		highlight: "Great Progress Tracking",
	},
	{
		quote: "As a busy parent, I appreciate how easy it is to monitor my child's learning journey. The personalized stories are perfect for her age group.",
		author: "Emma Rodriguez",
		role: "Mother of 6-year-old",
		avatar: "/avatars/parent3.png",
		rating: 5,
		highlight: "Perfect for Busy Parents",
	},
];

const stats = [
	{
		value: "10K+",
		label: "Active Students",
		icon: <Users className='w-6 h-6' />,
		description: "Growing community of young learners",
		gradient: "from-[#344e41] to-[#588157]",
	},
	{
		value: "500+",
		label: "Interactive Stories",
		icon: <BookOpen className='w-6 h-6' />,
		description: "Engaging educational content",
		gradient: "from-[#588157] to-[#a3b18a]",
	},
	{
		value: "95%",
		label: "Parent Satisfaction",
		icon: <Heart className='w-6 h-6' />,
		description: "Trusted by parents worldwide",
		gradient: "from-[#a3b18a] to-[#344e41]",
	},
	{
		value: "24/7",
		label: "AI Support",
		icon: <Bot className='w-6 h-6' />,
		description: "Always here to help",
		gradient: "from-[#344e41] to-[#a3b18a]",
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
								<Link href="/login">
									<Button className='group bg-[#344e41] text-white hover:bg-[#344e41]/90 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl'>
										Get Started
										<ArrowRight className='ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1' />
									</Button>
								</Link>
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
			<section className='py-20 bg-gradient-to-b from-white to-[#f5f7fa]'>
				<div className='container mx-auto px-4'>
					<div className='flex flex-col items-center text-center mb-16'>
						<span className='inline-block px-4 py-1.5 rounded-full bg-[#e9f5ee] text-[#344e41] text-sm font-semibold mb-4'>Features</span>
						<h2 className='text-4xl font-bold text-[#344e41] mb-4'>Why Choose Us?</h2>
						<p className='text-gray-600 max-w-2xl'>
							We combine cutting-edge technology with proven educational methods to create an engaging learning experience for your child.
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{features.map((feature, idx) => (
							<div
								key={idx}
								className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#e0e4e8]'
							>
								{/* Background gradient effect */}
								<div className='absolute inset-0 bg-gradient-to-br from-white to-[#f5f7fa] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

								{/* Content */}
								<div className='relative z-10'>
									{/* Icon with gradient background */}
									<div
										className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}
									>
										<div className='text-white'>{feature.icon}</div>
									</div>

									{/* Title with highlight */}
									<div className='flex items-center gap-2 mb-3'>
										<h3 className='text-xl font-bold text-[#344e41]'>{feature.title}</h3>
										<span className='px-2 py-0.5 text-xs font-semibold rounded-full bg-[#e9f5ee] text-[#344e41]'>{feature.highlight}</span>
									</div>

									{/* Description */}
									<p className='text-gray-600 mb-6'>{feature.desc}</p>

									{/* Stats with animated underline */}
									<div className='relative'>
										<div className='flex items-baseline gap-2'>
											<span className='text-2xl font-bold text-[#344e41]'>{feature.stats.value}</span>
											<span className='text-sm text-gray-500'>{feature.stats.label}</span>
										</div>
										<div className='absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#344e41] to-[#a3b18a] group-hover:w-full transition-all duration-300' />
									</div>

									{/* Hover effect elements */}
									<div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#344e41]/5 to-transparent rounded-full blur-2xl transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-300' />
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='py-20 bg-white relative overflow-hidden'>
				{/* Background Elements */}
				<div className='absolute inset-0 bg-[#f5f7fa] opacity-50'></div>
				<div className='absolute top-0 left-0 w-full h-full bg-[url("/grid.svg")] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]'></div>

				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
					<div className='text-center mb-16'>
						<div className='inline-block mb-4'>
							<span className='inline-flex items-center px-4 py-2 rounded-full bg-[#e9f5ee] text-[#344e41] text-sm font-medium'>
								Getting Started
							</span>
						</div>
						<h2 className='text-3xl md:text-4xl font-bold text-[#344e41] mb-4'>How It Works</h2>
						<p className='text-lg text-gray-600 max-w-2xl mx-auto'>Start your child's learning journey in three simple steps</p>
					</div>

					<div className='relative'>
						{/* Connection Line */}
						<div className='hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#344e41]/20 via-[#588157]/20 to-[#344e41]/20 -translate-y-1/2'></div>

						<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
							{steps.map((step, idx) => (
								<div
									key={idx}
									className='relative'
								>
									<Card className='group p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border border-[#e0e4e8]'>
										{/* Step Number */}
										<div className='absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#344e41] text-white flex items-center justify-center font-bold text-sm'>
											{idx + 1}
										</div>

										{/* Icon Container */}
										<div className='mb-6 relative'>
											<div className='absolute inset-0 bg-gradient-to-r from-[#344e41]/10 to-[#588157]/10 rounded-xl blur-xl transform group-hover:scale-110 transition-transform duration-300'></div>
											<div className='relative p-4 rounded-xl bg-[#e9f5ee] w-fit'>{step.icon}</div>
										</div>

										{/* Content */}
										<div>
											<h3 className='text-xl font-bold text-[#344e41] mb-3 group-hover:text-[#588157] transition-colors'>{step.title}</h3>
											<p className='text-gray-600 leading-relaxed'>{step.desc}</p>
										</div>

										{/* Arrow for connection */}
										{idx < steps.length - 1 && (
											<div className='hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2'>
												<ChevronRight className='w-6 h-6 text-[#344e41]/30' />
											</div>
										)}
									</Card>
								</div>
							))}
						</div>
					</div>

					{/* CTA Button */}
					<div className='mt-16 text-center'>
						<Link href="/login">
							<Button className='group bg-[#344e41] text-white hover:bg-[#344e41]/90 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl'>
								Get Started Now
								<ArrowRight className='ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1' />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className='py-20 bg-gradient-to-b from-white to-[#f5f7fa]'>
				<div className='container mx-auto px-4'>
					<div className='text-center mb-12'>
						<span className='inline-block px-4 py-1 rounded-full bg-[#e9f5ee] text-[#344e41] text-sm font-medium mb-4'>Testimonials</span>
						<h2 className='text-3xl md:text-4xl font-bold text-[#344e41] mb-4'>What Parents Say</h2>
						<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
							Join thousands of satisfied parents who have transformed their children's learning journey
						</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						{testimonials.map((testimonial, index) => (
							<div
								key={index}
								className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
							>
								{/* Decorative elements */}
								<div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#344e41]/5 to-transparent rounded-bl-full' />
								<div className='absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#a3b18a]/5 to-transparent rounded-tr-full' />

								{/* Content */}
								<div className='relative z-10'>
									{/* Rating */}
									<div className='flex gap-1 mb-4'>
										{[...Array(testimonial.rating)].map((_, i) => (
											<svg
												key={i}
												className='w-5 h-5 text-yellow-400'
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
											</svg>
										))}
									</div>

									{/* Quote */}
									<blockquote className='text-gray-600 mb-6 text-lg leading-relaxed'>"{testimonial.quote}"</blockquote>

									{/* Author */}
									<div className='flex items-center gap-4'>
										<div className='w-12 h-12 rounded-full bg-[#e9f5ee] flex items-center justify-center text-[#344e41] font-bold text-lg'>
											{testimonial.author[0]}
										</div>
										<div>
											<div className='font-semibold text-[#344e41]'>{testimonial.author}</div>
											<div className='text-sm text-gray-500'>{testimonial.role}</div>
										</div>
									</div>

									{/* Highlight badge */}
									<div className='absolute top-4 right-4'>
										<span className='inline-block px-3 py-1 rounded-full bg-[#e9f5ee] text-[#344e41] text-xs font-medium'>
											{testimonial.highlight}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Trust indicators */}
					<div className='mt-16 text-center'>
						<div className='inline-flex items-center gap-8 px-6 py-3 bg-white rounded-full shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-full bg-[#e9f5ee] flex items-center justify-center'>
									<svg
										className='w-4 h-4 text-[#344e41]'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
									</svg>
								</div>
								<span className='text-sm font-medium text-gray-600'>10,000+ Parents</span>
							</div>
							<div className='w-px h-6 bg-gray-200' />
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-full bg-[#e9f5ee] flex items-center justify-center'>
									<svg
										className='w-4 h-4 text-[#344e41]'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
									</svg>
								</div>
								<span className='text-sm font-medium text-gray-600'>4.9/5 Rating</span>
							</div>
							<div className='w-px h-6 bg-gray-200' />
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-full bg-[#e9f5ee] flex items-center justify-center'>
									<svg
										className='w-4 h-4 text-[#344e41]'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M10 12a2 2 0 100-4 2 2 0 000 4z' />
										<path
											fillRule='evenodd'
											d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<span className='text-sm font-medium text-gray-600'>98% Satisfaction</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-20 bg-gradient-to-b from-white to-[#f5f7fa]'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{stats.map((stat, index) => (
							<div
								key={index}
								className='group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
							>
								{/* Decorative elements */}
								<div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#344e41]/5 to-transparent rounded-bl-full' />
								<div className='absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#a3b18a]/5 to-transparent rounded-tr-full' />

								{/* Content */}
								<div className='relative z-10'>
									{/* Icon */}
									<div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
										<div className='text-white transform group-hover:scale-110 transition-transform duration-300'>{stat.icon}</div>
									</div>

									{/* Value */}
									<div className='text-3xl font-bold text-[#344e41] mb-2 group-hover:text-[#588157] transition-colors duration-300'>
										{stat.value}
									</div>

									{/* Label */}
									<div className='text-lg font-semibold text-[#344e41] mb-2'>{stat.label}</div>

									{/* Description */}
									<div className='text-sm text-gray-600'>{stat.description}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='relative py-20 overflow-hidden'>
				{/* Background Elements */}
				<div className='absolute inset-0 bg-gradient-to-br from-[#a3b18a] via-[#588157] to-[#344e41] opacity-90'></div>
				<div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]'></div>

				{/* Content */}
				<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<h2 className='text-4xl md:text-5xl font-extrabold text-white mb-6'>Ready to Start Your Child's Learning Journey?</h2>
						<p className='text-xl text-white/90 mb-12 max-w-2xl mx-auto'>
							Join thousands of parents who are already helping their children learn and grow with Buddy's interactive stories and personalized
							learning experience.
						</p>

						{/* CTA Button */}
						<div className='flex justify-center mb-12'>
							<Link href="/login">
								<Button className='group bg-white text-[#344e41] hover:bg-white/90 px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl'>
									Get Started Free
									<ArrowRight className='ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1' />
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Decorative Elements */}
				<div className='absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>
				<div className='absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>
			</section>

			{/* Footer */}
			<footer className='bg-[#344e41] text-white py-16'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>
						{/* Brand Section */}
						<div className='space-y-4'>
							<div className='flex items-center gap-2'>
								<img
									src='/images/puppet.png'
									alt='GuadeKids Logo'
									className='w-10 h-10 rounded-lg'
								/>
								<span className='text-2xl font-bold'>GuadeKids</span>
							</div>
							<p className='text-white/70 text-sm leading-relaxed'>
								Empowering children through interactive stories and personalized learning experiences. Join us in making education fun and
								engaging.
							</p>
							<div className='flex items-center gap-4 pt-2'>
								<a
									href='#'
									className='text-white/70 hover:text-white transition-colors'
									aria-label='Facebook'
								>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' />
									</svg>
								</a>
								<a
									href='#'
									className='text-white/70 hover:text-white transition-colors'
									aria-label='Twitter'
								>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' />
									</svg>
								</a>
								<a
									href='#'
									className='text-white/70 hover:text-white transition-colors'
									aria-label='Instagram'
								>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z' />
									</svg>
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className='font-semibold text-lg mb-4'>Quick Links</h3>
							<ul className='space-y-3'>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										How It Works
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										Success Stories
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										Pricing
									</a>
								</li>
							</ul>
						</div>

						{/* Resources */}
						<div>
							<h3 className='font-semibold text-lg mb-4'>Resources</h3>
							<ul className='space-y-3'>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										Blog
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										Help Center
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										Parent Guides
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-white/70 hover:text-white transition-colors text-sm'
									>
										FAQs
									</a>
								</li>
							</ul>
						</div>

						{/* Contact */}
						<div>
							<h3 className='font-semibold text-lg mb-4'>Contact Us</h3>
							<ul className='space-y-3'>
								<li className='flex items-center gap-2 text-white/70 text-sm'>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
										/>
									</svg>
									support@guadekids.com
								</li>
								<li className='flex items-center gap-2 text-white/70 text-sm'>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
										/>
									</svg>
									+251 977374409
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className='border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
						<p className='text-white/50 text-sm'>© {new Date().getFullYear()} GuadeKids. All rights reserved.</p>
						<div className='flex items-center gap-6'>
							<a
								href='#'
								className='text-white/50 hover:text-white text-sm transition-colors'
							>
								Privacy Policy
							</a>
							<a
								href='#'
								className='text-white/50 hover:text-white text-sm transition-colors'
							>
								Terms of Service
							</a>
							<a
								href='#'
								className='text-white/50 hover:text-white text-sm transition-colors'
							>
								Cookie Policy
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
