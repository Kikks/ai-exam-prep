import { Loader2, TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { plural, singular } from "pluralize";

interface DeleteConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: () => void;
	entityType: string;
	entityNames: string[];
	isDeleting: boolean;
}

export default function DeleteConfirmationDialog({
	open,
	onOpenChange,
	onDelete,
	isDeleting,
	entityType,
	entityNames
}: DeleteConfirmationDialogProps) {
	const handleClose = () => {
		if (isDeleting) return;
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[425px] max-h-[90vh] overflow-y-auto'>
				<div className='flex flex-col items-center space-y-2 py-5'>
					<div className='size-16 grid place-items-center bg-destructive/20 rounded-full'>
						<TrashIcon className='text-destructive size-8' />
					</div>

					<h1 className='text-lg text-center font-bold'>
						Delete{" "}
						{entityNames.length > 1 ? plural(entityType) : singular(entityType)}
					</h1>

					<p className='text-muted-foreground max-w-[35ch] text-sm text-center'>
						Are you sure you want to delete{" "}
						{entityNames.length === 1 ? "this" : "these"}{" "}
						{entityNames.length > 1 ? plural(entityType) : singular(entityType)}
						?
					</p>

					<ul className='list-disc space-y-2 !mt-10'>
						{entityNames?.map((name, index) => (
							<li
								key={index}
								className='font-semibold text-xs text-muted-foreground line-clamp-1'
							>
								- {name}
							</li>
						))}
					</ul>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose}>
						Cancel
					</Button>
					<Button
						variant='destructive'
						onClick={onDelete}
						disabled={isDeleting}
					>
						{isDeleting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
