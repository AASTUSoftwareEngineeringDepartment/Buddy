export default function AuthLayout({children}: {children: React.ReactNode}) {
	return (
		<div className='min-h-screen flex'>
			<div className='flex-1 flex items-center justify-center py-8'>{children}</div>
			<div className='hidden lg:block lg:w-[60%] relative'>
				<img
					src='/images/auth-image.png'
					alt='Authentication'
					className='absolute inset-0 w-full h-full object-cover'
				/>
			</div>
		</div>
	);
}
