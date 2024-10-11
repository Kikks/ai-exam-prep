import { motion, AnimatePresence } from "framer-motion";
import { FlashCardData } from "@/types";
import { useEffect, useState } from "react";

interface FlashCardProps {
	data: FlashCardData;
	isActive: boolean;
	isNext: boolean;
	isNextNext: boolean;
}

export default function FlashCard({
	data,
	isActive,
	isNext,
	isNextNext
}: FlashCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
	const [showAnswer, setShowAnswer] = useState(false);

	const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
		switch (difficulty) {
			case "easy":
				return "bg-green-500";
			case "medium":
				return "bg-yellow-500";
			case "hard":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const cardVariants = {
		active: { scale: 1, y: 0, zIndex: 3, opacity: 1 },
		next: { scale: 0.85, y: -30, zIndex: 2, opacity: 0.9 },
		nextNext: { scale: 0.7, y: -60, zIndex: 1, opacity: 0.8 },
		hidden: { scale: 0.55, y: -90, zIndex: 0, opacity: 0 }
	};

	// Flip the card to the question if it is not active
	useEffect(() => {
		if (!isActive && isFlipped) {
			setIsFlipped(false);
			setShowAnswer(false);
		}
	}, [isActive, isFlipped]);

	const handleFlip = () => {
		if (isActive) {
			setIsFlipped(!isFlipped);
			if (!isFlipped) {
				// Delay showing answer when flipping to answer side
				setTimeout(() => setShowAnswer(true), 250);
			} else {
				// Immediately hide answer when flipping to question side
				setShowAnswer(false);
			}
		}
	};

	return (
		<motion.div
			className={`absolute w-full h-full`}
			initial='hidden'
			animate={
				isActive
					? "active"
					: isNext
					? "next"
					: isNextNext
					? "nextNext"
					: "hidden"
			}
			variants={cardVariants}
			transition={{ duration: 0.5 }}
			style={{ perspective: 1000 }}
		>
			<motion.div
				className={`w-full h-full border border-muted rounded-lg shadow-lg cursor-pointer ${getDifficultyColor(
					data.difficulty
				)} flex items-center justify-center p-4 overflow-hidden`}
				onClick={handleFlip}
				animate={{ rotateY: isFlipped ? 180 : 0 }}
				transition={{ duration: 0.5 }}
				style={{ transformStyle: "preserve-3d" }}
			>
				{isActive && (
					<>
						<div
							className='absolute inset-0 w-full h-full flex items-center justify-center backface-hidden'
							style={{
								backfaceVisibility: "hidden",
								transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
							}}
						>
							<div className='p-4 text-center'>
								<h2 className='text-xl text-foreground dark:text-background font-bold mb-5'>
									Question
								</h2>
								<p className='text-foreground dark:text-background text-sm'>
									{data.question}
								</p>
							</div>
						</div>
						<div
							className='absolute inset-0 w-full h-full flex items-center justify-center backface-hidden'
							style={{
								backfaceVisibility: "hidden",
								transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)"
							}}
						>
							<AnimatePresence>
								{showAnswer && (
									<motion.div
										className='h-full w-full p-2'
										style={{ transform: "rotateY(180deg)" }}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}
									>
										<div className='h-full w-full rounded-md bg-background flex flex-col items-start text-left p-4'>
											<h2 className='text-xl text-foreground dark:text-background font-bold mb-3'>
												Answer
											</h2>
											<p className='text-foreground dark:text-background text-sm'>
												{data.answer}
											</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</>
				)}
			</motion.div>
		</motion.div>
	);
}
