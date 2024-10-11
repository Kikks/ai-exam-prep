import React from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { ChevronLeft, FilePlus, Loader2, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { SUPPORTED_FILE_TYPES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { Document } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";
import { getFileType } from "@/lib/utils";
import { generateImage } from "@/lib/images";
import { cleanText } from "@/actions/files";

interface AddDocumentDialogProps {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const options = [
	{
		key: "upload",
		title: "Upload from device",
		subtitle: "Select a document to summarize",
		icon: <MonitorUp size={48} />
	},
	{
		key: "create",
		title: "Create new document",
		subtitle: "Create a new document from scratch",
		icon: <FilePlus size={48} />
	}
];

const containerVariants = {
	hidden: {
		opacity: 0
	},
	visible: {
		opacity: 1,
		transition: {
			when: "beforeChildren",
			staggerChildren: 0.1
		}
	}
};

const itemVariants = {
	hidden: {
		opacity: 0,
		scale: 0.5
	},
	visible: {
		opacity: 1,
		scale: 1
	}
};

export default function AddDocumentDialog({
	open,
	setOpen
}: AddDocumentDialogProps) {
	const router = useRouter();
	const [file, setFile] = React.useState<File | null>(null);
	const [fileError, setFileError] = React.useState<string | null>(null);
	const [fileUploading, setFileUploading] = React.useState<boolean>(false);

	const [createIsLoading, setCreateIsLoading] = React.useState<boolean>(false);
	const [documentDetails, setDocumentDetails] = React.useState({
		title: "",
		content: ""
	});

	const [selectedOption, setSelectedOption] = React.useState<string | null>(
		null
	);
	const optionDetails = options.find(option => option.key === selectedOption);

	const isPending = fileUploading || createIsLoading;
	const { userId, isLoaded } = useAuth();

	const createDocument = async (document: Omit<Document, "id">) => {
		if (!isLoaded) return;

		const cleanedDocumentContent = await cleanText(document?.content ?? "");

		const { data, error } = await supabase
			.from("documents")
			.insert({
				...document,
				content: cleanedDocumentContent
			})
			.select();

		if (error) {
			toast.error("Something went wrong. Try again later.");
			return;
		}

		router.push(`/dashboard/library/${data?.[0]?.id}`);
	};

	const handleClose = () => {
		if (fileUploading) return;
		if (createIsLoading) return;
		if (isPending) return;

		setOpen(false);
		setSelectedOption(null);
		setFile(null);
		setFileError(null);
		setFileUploading(false);
		setCreateIsLoading(false);
		setDocumentDetails({
			title: "",
			content: ""
		});
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setDocumentDetails(prev => ({
			...prev,
			[e.target.name]: e.target.value
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFileError(null);
		const file = e.target.files?.[0];
		if (!file) return;

		// Check if file is supported
		if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
			toast.error("Invalid file type.");
			setFileError("Invalid file type.");
			return;
		}

		// Check if file size is less than 5MB
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size must be less than 5MB.");
			setFileError("File size must be less than 5MB.");
			return;
		}

		setFile(file);
	};

	const handleFileUpload = async () => {
		try {
			setFileUploading(true);

			if (!file) {
				toast.error("No file selected.");
				return;
			}

			const formData = new FormData();
			formData.append("file", file as File);

			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/api/file-extractor`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data"
					}
				}
			);

			if ((response?.data?.text || "").trim() === "") {
				toast.error("The text from your document could not be extracted.");
				return;
			}

			await createDocument({
				title: file?.name || "Untitled Document",
				content: response?.data?.text || null,
				file_type: getFileType(file?.type),
				file_url: null,
				token_count: null,
				mind_map_status: null,
				flash_cards_status: null,
				summary_status: null,
				image: generateImage() || null,
				study_pack_id: null,
				user_id: convertClerkIdToUUID(userId),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			});
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong. Try again later.");
		} finally {
			setFileUploading(false);
		}
	};

	const handleAddDocument = async () => {
		if (
			documentDetails.title.trim() === "" ||
			documentDetails.content.trim() === ""
		) {
			toast.error("Please fill out all fields.");
			return;
		}

		try {
			setCreateIsLoading(true);

			await createDocument({
				title: documentDetails.title,
				content: documentDetails.content,
				file_type: null,
				file_url: null,
				token_count: null,
				image: generateImage() || null,
				study_pack_id: null,
				mind_map_status: null,
				flash_cards_status: null,
				summary_status: null,
				user_id: convertClerkIdToUUID(userId),
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			});
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong. Try again later.");
		} finally {
			setCreateIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className={`w-[90%] ${
					selectedOption === "create" ? "sm:max-w-[700px]" : "sm:max-w-[425px]"
				}`}
			>
				<DialogHeader>
					<DialogTitle className='!text-left'>
						{selectedOption && (
							<Button
								onClick={() => setSelectedOption(null)}
								variant='outline'
								size='icon'
								className='mr-3 h-7 w-7'
							>
								<ChevronLeft size={16} />
							</Button>
						)}
						{optionDetails?.title || "Create Document"}
					</DialogTitle>
					<DialogDescription className='!text-left'>
						{optionDetails?.subtitle ||
							"Select an option below to create a new document"}
					</DialogDescription>
				</DialogHeader>

				{selectedOption === null && (
					<motion.div
						variants={containerVariants}
						initial='hidden'
						animate='visible'
						className='mt-5 flex items-center justify-center space-x-5'
					>
						{options.map(option => (
							<motion.button
								key={option.key}
								variants={itemVariants}
								className='flex aspect-square w-1/2 flex-col items-center justify-center space-y-5 rounded-xl border p-3 text-center'
								onClick={() => setSelectedOption(option.key)}
							>
								{option.icon}
								<span className='text-xs'>{option.title}</span>
							</motion.button>
						))}
					</motion.div>
				)}

				{selectedOption === "upload" && (
					<>
						<div className='mt-10 grid w-full items-center gap-1.5'>
							<Label htmlFor='document'>Select Document (max 5mb)</Label>
							<Input
								id='document'
								type='file'
								accept='.pdf,.doc,.docx,.csv,.txt'
								onChange={handleFileChange}
								disabled={fileUploading}
							/>
							<Label
								className={`text-xs text-muted-foreground/50 ${
									fileError ? "text-destructive" : ""
								}`}
								htmlFor='document'
							>
								{fileError || "Supported file types: pdf, doc, docx, csv, txt"}
							</Label>
						</div>

						<DialogFooter>
							<Button
								disabled={!file || fileUploading}
								type='submit'
								onClick={handleFileUpload}
							>
								{fileUploading ? (
									<Loader2 className='animate-spin mr-2' />
								) : null}
								{fileUploading ? "Uploading..." : "Upload Document"}
							</Button>
						</DialogFooter>
					</>
				)}

				{selectedOption === "create" && (
					<>
						<div className='mt-5 flex w-full flex-col items-center justify-center space-y-5'>
							<div className='grid w-full items-center gap-1.5'>
								<Label htmlFor='title'>Title</Label>
								<Input
									id='title'
									name='title'
									onChange={handleInputChange}
									placeholder='Enter your document title'
									disabled={createIsLoading || isPending}
								/>
							</div>

							<div className='mt-10 grid w-full items-center gap-1.5'>
								<Label htmlFor='title'>Content</Label>
								<Textarea
									id='content'
									name='content'
									onChange={handleInputChange}
									placeholder='Enter your document content'
									rows={15}
									disabled={createIsLoading || isPending}
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								disabled={
									documentDetails.title.trim() === "" ||
									documentDetails.content.trim() === "" ||
									createIsLoading
								}
								type='submit'
								onClick={handleAddDocument}
							>
								{createIsLoading ? (
									<Loader2 className='animate-spin mr-2' />
								) : null}
								{createIsLoading ? "Creating..." : "Create Document"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
