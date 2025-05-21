import type {Metadata} from "next";
import "./globals.css";
import {Toaster} from "sonner";
import {AuthProvider} from "@/lib/context/auth-context";
import {Providers} from "@/lib/providers";

export const metadata: Metadata = {
	title: "Buddy - Parent Dashboard",
	description: "Monitor and manage your children's learning journey",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className='font-sans antialiased'>
				<Providers>
					<AuthProvider>
						{children}
						<Toaster
							richColors
							position='top-right'
						/>
					</AuthProvider>
				</Providers>
			</body>
		</html>
	);
}
