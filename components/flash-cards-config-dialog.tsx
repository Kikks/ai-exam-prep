import { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue
} from "@/components/ui/select";
import { ACADEMIC_LEVELS, SUBJECTS } from "@/lib/constants";

export type FlashCardsConfig = {
	documentType: string;
	academicLevel: string;
	subject: string;
};

interface FlashCardsConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (flashCardsConfig: FlashCardsConfig) => void;
}

export default function FlashCardsConfigDialog({
	open,
	onOpenChange,
	onSubmit
}: FlashCardsConfigDialogProps) {
	const [flashCardsConfig, setFlashCardsConfig] = useState<FlashCardsConfig>({
		documentType: "",
		academicLevel: "undergraduate",
		subject: "stem"
	});

	const handleChange = (key: keyof FlashCardsConfig, value: string) => {
		setFlashCardsConfig(prev => ({ ...prev, [key]: value }));
	};

	const handleClose = () => {
		setFlashCardsConfig({
			documentType: "",
			academicLevel: "undergraduate",
			subject: "stem"
		});
		onOpenChange(false);
	};

	const handleSubmit = () => {
		onSubmit(flashCardsConfig);
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle className='!text-left'>Generate Flash Cards</DialogTitle>
					<DialogDescription className='!text-left'>
						Provide basic information about the document to generate flash
						cards.
					</DialogDescription>
				</DialogHeader>

				<div className='w-full space-y-5 my-10'>
					<div className='grid w-full items-center gap-1.5'>
						<Label htmlFor='document-type'>Document Type</Label>
						<Input
							id='document-type'
							type='text'
							placeholder='e.g. Lecture Note, Research Paper, etc.'
							onChange={e => handleChange("documentType", e.target.value)}
						/>
					</div>

					<div className='grid w-full items-center gap-1.5'>
						<Label htmlFor='academic-level'>Academic Level</Label>
						<Select
							onValueChange={value => handleChange("academicLevel", value)}
						>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select Academic Level' />
							</SelectTrigger>
							<SelectContent>
								{ACADEMIC_LEVELS.map(level => (
									<SelectItem key={level.value} value={level.value}>
										{level.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='grid w-full items-center gap-1.5'>
						<Label htmlFor='subject'>Subject</Label>
						<Select onValueChange={value => handleChange("subject", value)}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select Subject' />
							</SelectTrigger>
							<SelectContent>
								{SUBJECTS.map(subject => (
									<SelectItem key={subject.value} value={subject.value}>
										{subject.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose}>
						Cancel
					</Button>

					<Button
						disabled={
							flashCardsConfig.documentType.trim() === "" ||
							flashCardsConfig.academicLevel.trim() === "" ||
							flashCardsConfig.subject.trim() === ""
						}
						type='submit'
						onClick={handleSubmit}
					>
						Generate Flash Cards
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
