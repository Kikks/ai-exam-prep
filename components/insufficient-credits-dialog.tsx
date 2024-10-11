"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { HandCoins } from "lucide-react";
import { topupDialogOpenAtom } from "@/atoms/layout";
import { useSetAtom } from "jotai";

export default function InsufficientCreditsDialog({
	open,
	onOpenChange
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const setShowTopupDialog = useSetAtom(topupDialogOpenAtom);

	const handleClose = () => {
		onOpenChange(false);
	};

	const handleTopup = () => {
		setShowTopupDialog(true);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[425px]'>
				<div className='flex flex-col items-center space-y-2 py-5'>
					<div className='size-24 grid place-items-center bg-primary/20 rounded-full'>
						<HandCoins className='text-primary size-12' />
					</div>

					<h1 className='text-lg text-center font-bold'>
						Insufficient Credits
					</h1>

					<p className='text-muted-foreground max-w-[35ch] text-sm text-center'>
						You do not have enough credits to perform this action.
					</p>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleTopup}>Add Credits</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
