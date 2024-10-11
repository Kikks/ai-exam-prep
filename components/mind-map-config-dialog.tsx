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

export type MindMapConfig = {
	documentType: string;
	academicLevel: string;
	subject: string;
};

interface MindMapConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (mindMapConfig: MindMapConfig) => void;
}

export default function MindMapConfigDialog({
	open,
	onOpenChange,
	onSubmit
}: MindMapConfigDialogProps) {
	const [mindMapConfig, setMindMapConfig] = useState<MindMapConfig>({
		documentType: "",
		academicLevel: "undergraduate",
		subject: "stem"
	});

	const handleChange = (key: keyof MindMapConfig, value: string) => {
		setMindMapConfig(prev => ({ ...prev, [key]: value }));
	};

	const handleClose = () => {
		setMindMapConfig({
			documentType: "",
			academicLevel: "undergraduate",
			subject: "stem"
		});
		onOpenChange(false);
	};

	const handleSubmit = () => {
		onSubmit(mindMapConfig);
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle className='!text-left'>Generate Mind Map</DialogTitle>
					<DialogDescription className='!text-left'>
						Provide basic information about the document to generate a mind map.
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
							mindMapConfig.documentType.trim() === "" ||
							mindMapConfig.academicLevel.trim() === "" ||
							mindMapConfig.subject.trim() === ""
						}
						type='submit'
						onClick={handleSubmit}
					>
						Generate Mind Map
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
