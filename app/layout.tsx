import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
	JetBrains_Mono as FontJetBrains,
	Poppins as FontSans
} from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
	subsets: ["latin"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-sans"
});

const fontJetBrains = FontJetBrains({
	subsets: ["latin"],
	variable: "--font-jetbrains"
});

export const metadata: Metadata = {
	title: "StudyGenius",
	description: "You AI study assistant"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang='en'>
				<body
					className={cn(
						"antialiased",
						fontSans.variable,
						fontJetBrains.variable
					)}
				>
					<ThemeProvider
						attribute='class'
						defaultTheme='system'
						enableSystem
						disableTransitionOnChange
					>
						{children}

						<Toaster richColors />
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
