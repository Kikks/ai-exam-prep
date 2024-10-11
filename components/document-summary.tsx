import TextLoader from "@/components/text-loader";
import FormattedText from "@/components/formatted-text";
import { Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { DatabaseEnums } from "@/types";
import { useState } from "react";
import SummaryConfigDialog, { SummaryConfig } from "./summary-config-dialog";
import { useAtomValue, useSetAtom } from "jotai";
import { insufficientCreditsDialogOpenAtom } from "@/atoms/layout";
import { creditsBalanceAtom } from "@/atoms/wallet";

type SummaryStatus = DatabaseEnums["RESOURCE_GENERATION_STATUS"];

interface DocumentSummaryProps {
	isFetchingSummary: boolean;
	summary: string;
	summarizationCost: number;
	isSummarizing: boolean;
	summaryStatus?: SummaryStatus | null;
	handleSummarize: (summaryConfig: SummaryConfig) => void;
}

export default function DocumentSummary({
	isFetchingSummary,
	summary,
	isSummarizing,
	summarizationCost,
	handleSummarize,
	summaryStatus
}: DocumentSummaryProps) {
	const { isLoaded } = useAuth();
	const [summaryConfigDialogOpen, setSummaryConfigDialogOpen] = useState(false);
	const setShowInsufficientCreditsDialog = useSetAtom(
		insufficientCreditsDialogOpenAtom
	);
	const creditsBalance = useAtomValue(creditsBalanceAtom);

	const handleSummarizeClick = () => {
		if (creditsBalance < summarizationCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}

		setSummaryConfigDialogOpen(true);
	};

	return (
		<>
			{isFetchingSummary || !isLoaded || summaryStatus === "in_progress" ? (
				<TextLoader blocks={5} lines={5} />
			) : !summary || summaryStatus === "failed" ? (
				<div className='w-full flex flex-col items-center justify-center py-40 space-y-3'>
					<div className='size-24 grid place-items-center bg-primary/20 rounded-full'>
						<ScrollText className='text-primary size-12' />
					</div>
					<p className='text-center max-w-[35ch] text-xs'>
						{summaryStatus === "failed"
							? "Failed to generate summary; your credits have been restored for the attempt. Click the button below to try again."
							: "No summary generated yet. Click the button below to generate a summary."}
						<br />
						<br />
						This will cost you{" "}
						<span className='font-bold font-mono'>
							{summarizationCost}
						</span>{" "}
						credits.
					</p>
					<Button
						disabled={isSummarizing || !summarizationCost}
						onClick={handleSummarizeClick}
					>
						{isSummarizing && <Loader2 className='animate-spin mr-2' />}
						{isSummarizing ? "Summarizing..." : "Summarize"}
					</Button>
				</div>
			) : (
				<FormattedText text={summary} />
			)}

			<SummaryConfigDialog
				open={summaryConfigDialogOpen}
				onOpenChange={setSummaryConfigDialogOpen}
				onSubmit={handleSummarize}
			/>
		</>
	);
}
