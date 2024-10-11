"use client";

import {
	insufficientCreditsDialogOpenAtom,
	topupDialogOpenAtom
} from "@/atoms/layout";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/dashboard/navbar";
import Sidebar from "@/components/layout/dashboard/sidebar";
import { useAuth } from "@clerk/nextjs";
import { useAtom } from "jotai";
import { useEffect } from "react";
import InsufficientCreditsDialog from "@/components/insufficient-credits-dialog";

const CreditTopupDialog = dynamic(
	() => import("@/components/credit-topup-dialog"),
	{
		loading: () => <></>,
		ssr: false
	}
);

export default function DashboardLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const { getToken } = useAuth();
	const token = getToken();
	const [showCreditTopupDialog, setShowCreditTopupDialog] =
		useAtom(topupDialogOpenAtom);
	const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
		useAtom(insufficientCreditsDialogOpenAtom);

	useEffect(() => {
		const updateSupabaseToken = async () => {
			const token = await getToken({ template: "supabase" });
			localStorage.setItem("clerk-db-jwt", token || "");
		};

		updateSupabaseToken();
	}, [token]);

	return (
		<div className='relative h-screen overflow-hidden'>
			<Sidebar />

			<div className='ml-12 h-screen flex flex-col'>
				<Navbar />
				<main className='flex-1 overflow-y-auto'>{children}</main>
			</div>

			<CreditTopupDialog
				open={showCreditTopupDialog}
				onOpenChange={setShowCreditTopupDialog}
			/>

			<InsufficientCreditsDialog
				open={showInsufficientCreditsDialog}
				onOpenChange={setShowInsufficientCreditsDialog}
			/>
		</div>
	);
}
