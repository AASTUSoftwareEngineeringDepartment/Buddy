import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Toaster} from "sonner";
import {AuthProvider} from "@/lib/context/auth-context";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

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
			<body className={`${inter.variable} font-sans antialiased`}>
				<AuthProvider>
					{children}
					<Toaster
						richColors
						position='top-right'
					/>
				</AuthProvider>
			</body>
		</html>
	);
}
