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

export type SummaryConfig = {
	documentType: string;
	academicLevel: string;
	subject: string;
};

const academicLevels = [
	{ value: "high_school", label: "High School" },
	{ value: "undergraduate", label: "Undergraduate" },
	{ value: "graduate", label: "Graduate" },
	{ value: "phd", label: "PhD" }
];

const subjects = [
	{ value: "general", label: "General" },
	{ value: "stem", label: "STEM (Science, Technology, Engineering, Math)" },
	{
		value: "humanities",
		label: "Humanities (History, Literature, Philosophy, etc.)"
	},
	{
		value: "social_sciences",
		label: "Social Sciences (Psychology, Sociology, etc.)"
	},
	{ value: "arts", label: "Arts (Music, Visual, Performing, etc.)" },
	{
		value: "business",
		label: "Business (Finance, Marketing, Management, etc.)"
	},
	{ value: "law", label: "Law (Constitutional, Criminal, Civil, etc.)" },
	{
		value: "education",
		label: "Education (Teaching, Curriculum, etc.)"
	}
];

interface SummaryConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (summaryConfig: SummaryConfig) => void;
}

export default function SummaryConfigDialog({
	open,
	onOpenChange,
	onSubmit
}: SummaryConfigDialogProps) {
	const [summaryConfig, setSummaryConfig] = useState<SummaryConfig>({
		documentType: "",
		academicLevel: "undergraduate",
		subject: "stem"
	});

	const handleChange = (key: keyof SummaryConfig, value: string) => {
		setSummaryConfig(prev => ({ ...prev, [key]: value }));
	};

	const handleClose = () => {
		setSummaryConfig({
			documentType: "",
			academicLevel: "undergraduate",
			subject: "stem"
		});
		onOpenChange(false);
	};

	const handleSubmit = () => {
		onSubmit(summaryConfig);
		handleClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle className='!text-left'>Generate Summary</DialogTitle>
					<DialogDescription className='!text-left'>
						Provide basic information about the document to generate a summary.
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
								{academicLevels.map(level => (
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
								{subjects.map(subject => (
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
							summaryConfig.documentType.trim() === "" ||
							summaryConfig.academicLevel.trim() === "" ||
							summaryConfig.subject.trim() === ""
						}
						type='submit'
						onClick={handleSubmit}
					>
						Generate Summary
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
