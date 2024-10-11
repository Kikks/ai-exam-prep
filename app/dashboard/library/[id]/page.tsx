"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Document, FlashCard, MindMap, Summary } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";
import { toast } from "sonner";
import {
	ChevronRight,
	GraduationCap,
	Map,
	ScrollText,
	Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
	getFlashCardsCost,
	getMindMapCost,
	getSummarizationCost
} from "@/actions/cost";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { insufficientCreditsDialogOpenAtom } from "@/atoms/layout";
import { creditsBalanceAtom } from "@/atoms/wallet";
import DocumentSummary from "@/components/document-summary";
import DocumentView from "@/components/document-view";
import { SummaryConfig } from "@/components/summary-config-dialog";
import DocumentMindMap from "@/components/document-mind-map";
import { MindMapConfig } from "@/components/mind-map-config-dialog";
import { FlashCardsConfig } from "@/components/flash-cards-config-dialog";
import DocumentFlashCards from "@/components/document-flash-cards";

export default function DocumentPage() {
	const { id } = useParams();
	const router = useRouter();
	const { userId, isLoaded } = useAuth();
	const [document, setDocument] = useState<Document | null>(null);
	const [documentSummary, setDocumentSummary] = useState<Summary | null>(null);
	const [mindMap, setMindMap] = useState<MindMap | null>(null);
	const [flashCards, setFlashCards] = useState<FlashCard | null>(null);

	const [isFetching, setIsFetching] = useState(false);
	const [isFetchingSummary, setIsFetchingSummary] = useState(false);
	const [isFetchingMindMap, setIsFetchingMindMap] = useState(false);
	const [isFetchingFlashCards, setIsFetchingFlashCards] = useState(false);

	const [isSummarizing, setIsSummarizing] = useState(false);
	const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
	const [isGeneratingFlashCards, setIsGeneratingFlashCards] = useState(false);

	const [summarizationCost, setSummarizationCost] = useState(0);
	const [mindMapCost, setMindMapCost] = useState(0);
	const [flashCardsCost, setFlashCardsCost] = useState(0);

	const [isDrawerOpen, setIsDrawerOpen] = useState(true);
	const creditsBalance = useAtomValue(creditsBalanceAtom);
	const setShowInsufficientCreditsDialog = useSetAtom(
		insufficientCreditsDialogOpenAtom
	);

	const fetchDocument = async () => {
		if (!isLoaded) return;
		if (isFetching) return;

		setIsFetching(true);

		const { data, error } = await supabase
			.from("documents")
			.select("*")
			.eq("id", id)
			.eq("user_id", convertClerkIdToUUID(userId))
			.single();

		if (error) {
			setIsFetching(false);
			console.error(error);
			toast.error("Failed to fetch document");
			router.push("/dashboard/library");
			return;
		}

		setDocument(data);
		setIsFetching(false);
	};

	const fetchDocumentSummary = async () => {
		if (!isLoaded) return;
		if (isFetchingSummary) return;

		setIsFetchingSummary(true);

		const { data, error } = await supabase
			.from("summaries")
			.select("*")
			.eq("document_id", id)
			.eq("user_id", convertClerkIdToUUID(userId))
			.single();

		if (error) {
			console.error(error);
			setIsFetchingSummary(false);
			return;
		}

		setDocumentSummary(data);
		setIsFetchingSummary(false);
	};

	const fetchMindMap = async () => {
		if (!isLoaded) return;
		if (isFetchingMindMap) return;

		setIsFetchingMindMap(true);

		const { data, error } = await supabase
			.from("mind_maps")
			.select("*")
			.eq("document_id", id)
			.eq("user_id", convertClerkIdToUUID(userId))
			.single();

		if (error) {
			console.error(error);
			setIsFetchingMindMap(false);
			return;
		}

		setMindMap(data);
		setIsFetchingMindMap(false);
	};

	const fetchFlashCards = async () => {
		if (!isLoaded) return;
		if (isFetchingFlashCards) return;

		setIsFetchingFlashCards(true);

		const { data, error } = await supabase
			.from("flash_cards")
			.select("*")
			.eq("document_id", id)
			.eq("user_id", convertClerkIdToUUID(userId))
			.single();

		if (error) {
			console.error(error);
			setIsFetchingFlashCards(false);
			return;
		}

		setFlashCards(data);
		setIsFetchingFlashCards(false);
	};

	const handleSummarize = async (summaryConfig: SummaryConfig) => {
		if (!document) return;

		if (creditsBalance < summarizationCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}
		setIsSummarizing(true);

		try {
			await axios.post("/api/summarize-document", {
				documentId: document.id,
				userId: convertClerkIdToUUID(userId),
				...summaryConfig
			});

			toast.success("Summarization initiated");
		} catch (error: any) {
			console.error(error);
			toast.error(
				error.response.data.message || "Failed to summarize document"
			);
		} finally {
			setIsSummarizing(false);
		}
	};

	const handleGenerateMindMap = async (mindMapConfig: MindMapConfig) => {
		if (!document) return;

		if (creditsBalance < summarizationCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}

		setIsGeneratingMindMap(true);

		try {
			await axios.post("/api/generate-document-mind-map", {
				documentId: document.id,
				userId: convertClerkIdToUUID(userId),
				...mindMapConfig
			});

			toast.success("Mind map generation initiated");
		} catch (error: any) {
			console.error(error);
			toast.error(error.response.data.message || "Failed to generate mind map");
		} finally {
			setIsGeneratingMindMap(false);
		}
	};

	const handleGenerateFlashCards = async (
		flashCardsConfig: FlashCardsConfig
	) => {
		if (!document) return;

		if (creditsBalance < flashCardsCost) {
			setShowInsufficientCreditsDialog(true);
			return;
		}

		setIsGeneratingFlashCards(true);

		try {
			await axios.post("/api/generate-document-flash-cards", {
				documentId: document.id,
				userId: convertClerkIdToUUID(userId),
				...flashCardsConfig
			});

			toast.success("Flash cards generation initiated");
		} catch (error: any) {
			console.error(error);
			toast.error(
				error.response.data.message || "Failed to generate flash cards"
			);
		} finally {
			setIsGeneratingFlashCards(false);
		}
	};

	useEffect(() => {
		if (id && isLoaded) {
			fetchDocument();
			fetchDocumentSummary();
			fetchMindMap();
			fetchFlashCards();
		}
	}, [id, isLoaded]);

	useEffect(() => {
		if (document?.content) {
			getSummarizationCost(document?.content ?? "").then(cost => {
				setSummarizationCost(cost);
			});
			getMindMapCost(document?.content ?? "").then(cost => {
				setMindMapCost(cost);
			});
			getFlashCardsCost(document?.content ?? "").then(cost => {
				setFlashCardsCost(cost);
			});
		}
	}, [document?.content]);

	useEffect(() => {
		if (isLoaded && id) {
			const subscription = supabase
				.channel("documents")
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "documents",
						filter: `id=eq.${id}`
					},
					payload => {
						setDocument(prev => {
							if (!prev) return payload.new as Document;
							return {
								...prev,
								...((payload?.new ?? {}) as Document)
							};
						});
						if (payload.new?.summary_status === "completed") {
							fetchDocumentSummary();
						}
						if (payload.new?.mind_map_status === "completed") {
							fetchMindMap();
						}
						if (payload.new?.flash_cards_status === "completed") {
							fetchFlashCards();
						}
					}
				)
				.subscribe();

			return () => {
				subscription.unsubscribe();
			};
		}
	}, [id, isLoaded]);

	return (
		<div className='w-full h-full overflow-y-hidden flex'>
			<DocumentView document={document} isFetching={isFetching} />

			<motion.aside
				// 540px width + (20px on both sides) padding
				initial={{ width: 540 + 2 * 20 }}
				// 540px width + (20px on both sides) padding
				animate={{ width: isDrawerOpen ? 540 + 2 * 20 : 0 }}
				transition={{ duration: 0.3 }}
				className={cn(
					"h-full bg-muted overflow-y-auto border-l py-5",
					isDrawerOpen ? "px-5" : "px-0"
				)}
			>
				<Tabs defaultValue='summary' className='w-full h-full'>
					<TabsList>
						<TabsTrigger value='summary'>
							<ScrollText className='mr-2 size-4' />
							Summary
						</TabsTrigger>
						<TabsTrigger value='mind-map'>
							<Map className='mr-2 size-4' />
							Mind Map
						</TabsTrigger>
						<TabsTrigger value='flash-cards'>
							<Zap className='mr-2 size-4' />
							Flash Cards
						</TabsTrigger>
					</TabsList>
					<TabsContent value='summary' className='py-5'>
						<DocumentSummary
							isFetchingSummary={isFetchingSummary}
							summary={documentSummary?.content ?? ""}
							isSummarizing={isSummarizing}
							summarizationCost={summarizationCost}
							handleSummarize={handleSummarize}
							summaryStatus={document?.summary_status}
						/>
					</TabsContent>
					<TabsContent value='mind-map' className='h-[95%]'>
						<DocumentMindMap
							isFetchingMindMap={isFetchingMindMap}
							mindMap={mindMap}
							isGeneratingMindMap={isGeneratingMindMap}
							mindMapCost={mindMapCost}
							handleGenerateMindMap={handleGenerateMindMap}
							mindMapStatus={document?.mind_map_status}
						/>
					</TabsContent>
					<TabsContent value='flash-cards' className='h-[95%]'>
						<DocumentFlashCards
							isFetchingFlashCards={isFetchingFlashCards}
							flashCards={flashCards}
							isGeneratingFlashCards={isGeneratingFlashCards}
							flashCardsCost={flashCardsCost}
							handleGenerateFlashCards={handleGenerateFlashCards}
							flashCardsStatus={document?.flash_cards_status}
						/>
					</TabsContent>
				</Tabs>
			</motion.aside>

			<Button
				size='icon'
				className='fixed right-4 top-16'
				onClick={() => setIsDrawerOpen(!isDrawerOpen)}
			>
				{isDrawerOpen ? (
					<ChevronRight className='h-4 w-4' />
				) : (
					<motion.div
						animate={{ scale: [1, 1.5, 1] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						<GraduationCap className='h-4 w-4' />
					</motion.div>
				)}
			</Button>
		</div>
	);
}
