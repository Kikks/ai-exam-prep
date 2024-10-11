import TextLoader from "@/components/text-loader";
import { ArrowLeft, ArrowRight, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
	DatabaseEnums,
	FlashCard as FlashCardType,
	FlashCardData
} from "@/types";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import FlashCardsConfigDialog, {
	FlashCardsConfig
} from "./flash-cards-config-dialog";
import FlashCard from "./flash-card";
import { useAtomValue, useSetAtom } from "jotai";
import { insufficientCreditsDialogOpenAtom } from "@/atoms/layout";
import { creditsBalanceAtom } from "@/atoms/wallet";

type SummaryStatus = DatabaseEnums["RESOURCE_GENERATION_STATUS"];

interface DocumentFlashCardsProps {
	isFetchingFlashCards: boolean;
	flashCards: FlashCardType | null;
	flashCardsCost: number;
	isGeneratingFlashCards: boolean;
	flashCardsStatus?: SummaryStatus | null;
	handleGenerateFlashCards: (flashCardsConfig: FlashCardsConfig) => void;
}

export default function DocumentFlashCards({
	isFetchingFlashCards,
	flashCards,
	isGeneratingFlashCards,
	flashCardsCost,
	handleGenerateFlashCards,
	flashCardsStatus
}: DocumentFlashCardsProps) {
	const [currentCardIndex, setCurrentCardIndex] = useState(0);

	const data = (flashCards?.data ?? []) as FlashCardData[];

	const handleNextCard = () => {
		setCurrentCardIndex(prevIndex => (prevIndex + 1) % (data?.length ?? 0));
	};

	const handlePrevCard = () => {
		setCurrentCardIndex(
			prevIndex => (prevIndex - 1 + (data?.length ?? 0)) % (data?.length ?? 0)
		);
	};

	const { isLoaded } = useAuth();
	const [flashCardsConfigDialogOpen, setFlashCardsConfigDialogOpen] =
		useState(false);
	const setShowInsufficientCreditsDialog = useSetAtom(
		insufficientCreditsDialogOpenAtom
	);
	const creditsBalance = useAtomValue(creditsBalanceAtom);

	const handleGenerateClick = () => {
		if (creditsBalance < flashCardsCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}

		setFlashCardsConfigDialogOpen(true);
	};

	return (
		<>
			{isFetchingFlashCards ||
			!isLoaded ||
			flashCardsStatus === "in_progress" ? (
				<TextLoader blocks={5} lines={5} />
			) : data.length === 0 || flashCardsStatus === "failed" ? (
				<div className='w-full flex flex-col items-center justify-center py-40 space-y-3'>
					<div className='size-24 grid place-items-center bg-primary/20 rounded-full'>
						<Zap className='text-primary size-12' />
					</div>
					<p className='text-center max-w-[35ch] text-xs'>
						{flashCardsStatus === "failed"
							? "Failed to generate flash cards; your credits have been restored for the attempt. Click the button below to try again."
							: "No flash cards generated yet. Click the button below to generate flash cards."}
						<br />
						<br />
						This will cost you{" "}
						<span className='font-bold font-mono'>{flashCardsCost}</span>{" "}
						credits.
					</p>
					<Button
						disabled={isGeneratingFlashCards || !flashCardsCost}
						onClick={handleGenerateClick}
					>
						{isGeneratingFlashCards && (
							<Loader2 className='animate-spin mr-2' />
						)}
						{isGeneratingFlashCards ? "Generating..." : "Generate"}
					</Button>
				</div>
			) : (
				<div className='flex flex-col items-center justify-center h-full space-y-20'>
					<div className='relative w-96 h-56'>
						<AnimatePresence>
							{data.map((card, index) => (
								<FlashCard
									key={index}
									data={card}
									isActive={index === currentCardIndex}
									isNext={index === (currentCardIndex + 1) % data.length}
									isNextNext={index === (currentCardIndex + 2) % data.length}
								/>
							))}
						</AnimatePresence>
					</div>

					<div className='flex items-center space-x-5'>
						<Button size='icon' variant='outline' onClick={handlePrevCard}>
							<ArrowLeft className='size-5' />
						</Button>

						<div className='text-muted-foreground text-sm font-mono tracking-widest'>
							{currentCardIndex + 1} / {data.length}
						</div>

						<Button size='icon' variant='outline' onClick={handleNextCard}>
							<ArrowRight className='size-5' />
						</Button>
					</div>
				</div>
			)}

			<FlashCardsConfigDialog
				open={flashCardsConfigDialogOpen}
				onOpenChange={setFlashCardsConfigDialogOpen}
				onSubmit={handleGenerateFlashCards}
			/>
		</>
	);
}
