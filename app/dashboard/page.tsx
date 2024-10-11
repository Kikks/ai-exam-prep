"use client";

import TextLoader from "@/components/text-loader";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import { supabase } from "@/lib/supabase";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";
import { getGreetings } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowRight, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DocumentCard from "@/components/document-card";
import { Document } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import AddDocumentDialog from "@/components/add-document-dialog";

const parentVariants = {
	initial: { opacity: 0 },
	animate: {
		opacity: 1,
		transition: {
			delay: 0.5,
			staggerChildren: 0.15
		}
	},
	exit: { opacity: 0 }
};

export default function Dashboard() {
	const { userId } = useAuth();
	const { user, isLoaded } = useUser();
	const greetings = getGreetings();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
	const [recentDocuments, setRecentDocuments] = useState<Partial<Document>[]>(
		[]
	);

	const fetchDocuments = async () => {
		if (!isLoaded) return;
		setIsLoading(true);

		try {
			const { error, data } = await supabase
				.from("documents")
				.select("id, title, created_at, image")
				.eq("user_id", convertClerkIdToUUID(userId))
				.order("created_at", { ascending: false })
				.limit(3);

			if (error) {
				throw error;
			}

			setRecentDocuments(data);
		} catch (error: any) {
			console.error(error);
			toast.error(error?.message ?? "Failed to fetch documents");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDocuments();
	}, [isLoaded]);

	return (
		<div className='container mx-auto px-4 py-8 flex flex-col space-y-20'>
			<div className='w-full flex justify-center pt-10'>
				{!isLoaded ? (
					<div className='w-[600px] mt-10 py-5'>
						<TextLoader
							lines={1}
							blocks={1}
							skeletonClassName='h-10 w-[600px]'
						/>
					</div>
				) : (
					<TextAnimate text={`${greetings} ${user?.firstName}`} type='popIn' />
				)}
			</div>

			<div className='w-full flex flex-col space-y-10'>
				<div className='w-full flex justify-between'>
					{!isLoaded ? (
						<TextLoader lines={1} blocks={1} skeletonClassName='h-8' />
					) : (
						<h1 className='text-2xl font-bold mb-6'>
							Let&apos;s continue studying!
						</h1>
					)}

					{!isLoaded ? (
						<div className='w-[150px]'>
							<TextLoader lines={1} blocks={1} skeletonClassName='h-8' />
						</div>
					) : (
						<Button
							variant='link'
							onClick={() => router.push("/dashboard/library")}
						>
							View all documents
							<ArrowRight className='ml-2 size-4' />
						</Button>
					)}
				</div>

				{isLoading || !isLoaded ? (
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5'>
						{Array(3)
							.fill(0)
							.map((_, index) => (
								<div key={index} className='w-full space-y-3'>
									<Skeleton className='w-full aspect-video' />

									<div className='space-y-1'>
										<Skeleton className='w-full h-3' />
										<Skeleton className='w-2/3 h-3' />
									</div>
								</div>
							))}
					</div>
				) : (
					<motion.div
						variants={parentVariants}
						initial='initial'
						animate='animate'
						exit='exit'
						className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5'
					>
						{recentDocuments.map(document => (
							<DocumentCard
								key={document?.id}
								showCheckbox={false}
								document={document}
							/>
						))}

						<motion.button
							onClick={() => setShowAddDocumentDialog(true)}
							whileHover={{ scale: 1.05 }}
							className='size-40 rounded-xl flex flex-col items-center justify-center text-center bg-muted'
						>
							<PlusIcon className='size-10 text-primary' />
							<span className='text-xs'>Create Document</span>
						</motion.button>
					</motion.div>
				)}
			</div>

			<AddDocumentDialog
				open={showAddDocumentDialog}
				setOpen={setShowAddDocumentDialog}
			/>
		</div>
	);
}
