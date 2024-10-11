import { encodingForModel, TiktokenModel } from "js-tiktoken";
import {
	CREDIT_RATE_PER_NAIRA,
	NAIRA_PER_USD,
	USD_COST_PER_TOKEN,
	USD_COST_PER_TOKEN_FOR_FLASHCARDS,
	USD_COST_PER_TOKEN_FOR_MIND_MAP
} from "./constants";

class TokenTracker {
	private tokenCounts: { [key: string]: number } = {};
	private encoder: any;

	constructor(private model: TiktokenModel = "gpt-3.5-turbo") {}

	async initialize() {
		this.encoder = await encodingForModel(this.model);
	}

	trackTokens(stage: string, text: string) {
		const tokens = this.encoder.encode(text);
		const count = tokens.length;
		this.tokenCounts[stage] = (this.tokenCounts[stage] || 0) + count;
	}

	getTokenCounts() {
		return this.tokenCounts;
	}

	getTotalTokens() {
		return Object.values(this.tokenCounts).reduce((a, b) => a + b, 0);
	}

	free() {
		if (this.encoder) {
			this.encoder.free();
		}
	}
}

export async function createTokenTracker(
	model: TiktokenModel = "gpt-3.5-turbo"
) {
	const tracker = new TokenTracker(model);
	await tracker.initialize();
	return tracker;
}

export async function calculateSummarizationCredits(
	documentContent: string
): Promise<number> {
	const tokenTracker = await createTokenTracker();
	tokenTracker.trackTokens("documentContent", documentContent);
	const totalTokens = tokenTracker.getTotalTokens();

	const usdCostPerToken = USD_COST_PER_TOKEN;
	const usdCost = usdCostPerToken * totalTokens;

	const nairaCost = usdCost * NAIRA_PER_USD;
	const creditCost = nairaCost * CREDIT_RATE_PER_NAIRA;

	return Number(creditCost.toFixed(2));
}

export async function calculateMindMapCredits(
	documentContent: string
): Promise<number> {
	const tokenTracker = await createTokenTracker();
	tokenTracker.trackTokens("documentContent", documentContent);
	const totalTokens = tokenTracker.getTotalTokens();

	const usdCostPerToken = USD_COST_PER_TOKEN_FOR_MIND_MAP;
	const usdCost = usdCostPerToken * totalTokens;

	const nairaCost = usdCost * NAIRA_PER_USD;
	const creditCost = nairaCost * CREDIT_RATE_PER_NAIRA;

	return Number(creditCost.toFixed(2));
}

export async function calculateFlashCardsCredits(
	documentContent: string
): Promise<number> {
	const tokenTracker = await createTokenTracker();
	tokenTracker.trackTokens("documentContent", documentContent);
	const totalTokens = tokenTracker.getTotalTokens();

	const usdCostPerToken = USD_COST_PER_TOKEN_FOR_FLASHCARDS;
	const usdCost = usdCostPerToken * totalTokens;

	const nairaCost = usdCost * NAIRA_PER_USD;
	const creditCost = nairaCost * CREDIT_RATE_PER_NAIRA;

	return Number(creditCost.toFixed(2));
}
