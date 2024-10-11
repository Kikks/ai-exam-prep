"use server";

import {
	calculateFlashCardsCredits,
	calculateMindMapCredits,
	calculateSummarizationCredits
} from "@/lib/tokens";

export const getSummarizationCost = async (content: string) => {
	const cost = await calculateSummarizationCredits(content);
	return cost;
};

export const getMindMapCost = async (content: string) => {
	const cost = await calculateMindMapCredits(content);
	return cost;
};

export const getFlashCardsCost = async (content: string) => {
	const cost = await calculateFlashCardsCredits(content);
	return cost;
};
