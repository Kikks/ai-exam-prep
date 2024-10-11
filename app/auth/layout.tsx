"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const { isSignedIn, isLoaded } = useAuth();
	const { push } = useRouter();

	if (!isLoaded) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900'></div>
			</div>
		);
	}

	if (isSignedIn) {
		push("/dashboard");
	}

	return (
		<main className='min-h-screen grid place-items-center w-screen'>
			{children}
		</main>
	);
}
