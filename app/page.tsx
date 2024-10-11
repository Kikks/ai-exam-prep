"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
	const { isSignedIn, isLoaded } = useAuth();
	const router = useRouter();
	if (!isLoaded) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900'></div>
			</div>
		);
	}

	if (isSignedIn) {
		router.push("/dashboard");
	}

	if (!isSignedIn) {
		router.push("/auth/login");
	}

	return <></>;
}
