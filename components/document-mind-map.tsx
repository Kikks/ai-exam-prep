import TextLoader from "@/components/text-loader";
import { Map, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { DatabaseEnums, MindMap as MindMapType, TreeNode } from "@/types";
import { useState } from "react";
import MindMap from "./mind-map";
import MindMapConfigDialog, { MindMapConfig } from "./mind-map-config-dialog";
import { useAtomValue, useSetAtom } from "jotai";
import { creditsBalanceAtom } from "@/atoms/wallet";
import { insufficientCreditsDialogOpenAtom } from "@/atoms/layout";

type MaindMapStatus = DatabaseEnums["RESOURCE_GENERATION_STATUS"];

interface DocumentMindMapProps {
	isFetchingMindMap: boolean;
	mindMap?: MindMapType | null;
	mindMapCost: number;
	isGeneratingMindMap: boolean;
	mindMapStatus?: MaindMapStatus | null;
	handleGenerateMindMap: (mindMapConfig: MindMapConfig) => void;
}

export default function DocumentMindMap({
	isFetchingMindMap,
	mindMap,
	mindMapCost,
	isGeneratingMindMap,
	mindMapStatus,
	handleGenerateMindMap
}: DocumentMindMapProps) {
	const { isLoaded } = useAuth();
	const [mindMapConfigDialogOpen, setMindMapConfigDialogOpen] = useState(false);
	const setShowInsufficientCreditsDialog = useSetAtom(
		insufficientCreditsDialogOpenAtom
	);
	const creditsBalance = useAtomValue(creditsBalanceAtom);

	const handleGenerateClick = () => {
		if (creditsBalance < mindMapCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}

		setMindMapConfigDialogOpen(true);
	};

	return (
		<>
			{isFetchingMindMap || !isLoaded || mindMapStatus === "in_progress" ? (
				<TextLoader blocks={5} lines={5} />
			) : !mindMap || mindMapStatus === "failed" ? (
				<div className='w-full flex flex-col items-center justify-center py-40 space-y-3'>
					<div className='size-24 grid place-items-center bg-primary/20 rounded-full'>
						<Map className='text-primary size-12' />
					</div>
					<p className='text-center max-w-[35ch] text-xs'>
						{mindMapStatus === "failed"
							? "Failed to generate mind map; your credits have been restored for the attempt. Click the button below to try again."
							: "No mind map generated yet. Click the button below to generate a mind map."}
						<br />
						<br />
						This will cost you{" "}
						<span className='font-bold font-mono'>{mindMapCost}</span> credits.
					</p>
					<Button
						disabled={isGeneratingMindMap || !mindMapCost}
						onClick={handleGenerateClick}
					>
						{isGeneratingMindMap && <Loader2 className='animate-spin mr-2' />}
						{isGeneratingMindMap ? "Generating..." : "Generate"}
					</Button>
				</div>
			) : (
				<MindMap data={(mindMap?.data ?? {}) as TreeNode} />
			)}

			<MindMapConfigDialog
				open={mindMapConfigDialogOpen}
				onOpenChange={setMindMapConfigDialogOpen}
				onSubmit={handleGenerateMindMap}
			/>
		</>
	);
}
