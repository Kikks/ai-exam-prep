"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/hooks/useDebounce";
import { Document } from "@/types";
import { LibraryIcon, PlusIcon, Search, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";
import { toast } from "sonner";
import AddDocumentDialog from "@/components/add-document-dialog";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import DocumentCard from "@/components/document-card";

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

export default function Library() {
	const [search, setSearch] = useState("");
	const [documents, setDocuments] = useState<Partial<Document>[]>([]);
	const debouncedSearch = useDebounce(search, 500);
	const [isLoading, setIsLoading] = useState(false);
	const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
	const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
		useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
	const { userId, isLoaded } = useAuth();

	const documentsToDelete = useMemo(() => {
		return documents.filter(document =>
			selectedDocuments.includes(document.id ?? "")
		);
	}, [documents, selectedDocuments]);

	const fetchDocuments = async () => {
		if (!isLoaded) return;
		setIsLoading(true);

		try {
			const { data, error } =
				debouncedSearch.trim() === ""
					? await supabase
							.from("documents")
							.select("id, title, created_at, image")
							.eq("user_id", convertClerkIdToUUID(userId))
							.order("created_at", { ascending: false })
					: await supabase
							.from("documents")
							.select("id, title, created_at, image")
							.eq("user_id", convertClerkIdToUUID(userId))
							.ilike("title", `%${debouncedSearch}%`)
							.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			setDocuments(data);
		} catch (error: any) {
			console.error(error);
			toast.error(error?.message ?? "Failed to fetch documents");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteDocuments = async (documentIds: string[]) => {
		setIsDeleting(true);

		try {
			const { error: deleteSummariesError } = await supabase
				.from("summaries")
				.delete()
				.eq("user_id", convertClerkIdToUUID(userId))
				.in("document_id", documentIds.filter(Boolean));

			if (deleteSummariesError) {
				throw deleteSummariesError;
			}

			const { error } = await supabase
				.from("documents")
				.delete()
				.eq("user_id", convertClerkIdToUUID(userId))
				.in("id", documentIds.filter(Boolean));

			if (error) {
				throw error;
			}

			setSelectedDocuments([]);
			setShowDeleteConfirmationDialog(false);
			toast.success("Documents deleted successfully");
			fetchDocuments();
		} catch (error: any) {
			console.error(error);
			toast.error(error?.message ?? "Failed to delete documents");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSelectAll = () => {
		setSelectedDocuments(documents.map(document => document.id ?? ""));
	};

	const handleUnselectAll = () => {
		setSelectedDocuments([]);
	};

	const handleCheckChange = (documentId: string) => {
		console.log("documentId", documentId);
		if (selectedDocuments.includes(documentId)) {
			setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
		} else {
			setSelectedDocuments([...selectedDocuments, documentId]);
		}
	};

	useEffect(() => {
		fetchDocuments();
	}, [debouncedSearch, isLoaded]);

	return (
		<div className='container mx-auto px-4 py-8 space-y-10'>
			<div className='w-full flex items-center justify-between'>
				<h1 className='text-3xl font-bold'>Library</h1>

				<div className='space-x-2 flex items-center'>
					<div className='relative'>
						<Search className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							value={search}
							onChange={e => setSearch(e.target.value)}
							placeholder='Search library'
							className='pl-7 min-w-[300px]'
							type='search'
						/>
					</div>

					{selectedDocuments.length > 0 && (
						<>
							<Button
								variant='secondary'
								onClick={
									selectedDocuments.length === documents.length
										? handleUnselectAll
										: handleSelectAll
								}
							>
								{selectedDocuments.length === documents.length
									? "Unselect All"
									: "Select All"}
							</Button>
							<Button
								variant='destructive'
								onClick={() => setShowDeleteConfirmationDialog(true)}
							>
								<TrashIcon className='w-4 h-4 mr-2' />
								Delete
							</Button>
						</>
					)}

					<Button onClick={() => setShowAddDocumentDialog(true)}>
						<PlusIcon className='w-4 h-4 mr-2' />
						Add Document
					</Button>
				</div>
			</div>

			<div className='space-y-5'>
				{documents.length === 0 && !isLoading ? (
					<div className='w-full grid place-items-center gap-5 py-40 text-center'>
						<LibraryIcon className='w-24 h-24 text-muted-foreground' />
						<span className='text-sm text-muted-foreground max-w-[35ch]'>
							Your library is empty, add a document to get started.
						</span>
						<Button onClick={() => setShowAddDocumentDialog(true)}>
							<PlusIcon className='w-4 h-4 mr-2' />
							Add Document
						</Button>
					</div>
				) : (
					<motion.div
						variants={parentVariants}
						initial='initial'
						animate='animate'
						exit='exit'
						className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5'
					>
						{documents.map(document => (
							<DocumentCard
								key={document?.id}
								isChecked={selectedDocuments.includes(document?.id ?? "")}
								onCheckClick={() => handleCheckChange(document?.id ?? "")}
								document={document}
							/>
						))}
					</motion.div>
				)}

				{(isLoading || !isLoaded) && (
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5'>
						{Array(10)
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
				)}
			</div>

			<AddDocumentDialog
				open={showAddDocumentDialog}
				setOpen={setShowAddDocumentDialog}
			/>

			<DeleteConfirmationDialog
				open={showDeleteConfirmationDialog}
				onOpenChange={setShowDeleteConfirmationDialog}
				isDeleting={isDeleting}
				entityType='documents'
				onDelete={() => handleDeleteDocuments(selectedDocuments)}
				entityNames={documentsToDelete.map(document => document.title ?? "")}
			/>
		</div>
	);
}
