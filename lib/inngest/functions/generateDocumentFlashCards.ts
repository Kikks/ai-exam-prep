/* eslint-disable @typescript-eslint/ban-ts-comment */
import { inngest } from "@/lib/inngest";
import { generateFlashCardsMetaPrompt } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import { createTokenTracker } from "@/lib/tokens";
import { FlashCardData } from "@/types";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const model = new ChatAnthropic({ modelName: "claude-3-5-sonnet-20240620" });

export const generateFlashCards = inngest.createFunction(
	{ id: "generate-flash-cards" },
	{ event: "document/generate-flash-cards" },
	async ({ event, step }) => {
		const {
			documentId,
			userId,
			credits,
			transactionId,
			documentType,
			academicLevel,
			subject
		} = event.data;

		const tokenTracker = await createTokenTracker();
		let tokenCounts: Record<string, number> = {};

		try {
			// 1. Update the status of the flash cards generation to in_progress
			await step.run("update-flash-cards-status", async () => {
				const { data: flashCardsData, error: updateError } = await supabase
					.from("documents")
					.update({ flash_cards_status: "in_progress" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("flash_cards_status");

				if (updateError) {
					throw new Error(
						`Failed to update flash cards status: ${updateError.message}`
					);
				}

				return flashCardsData;
			});

			// 2. Get the summary or full document content
			const documentData = await step.run("fetch-document-data", async () => {
				// First, try to fetch the summary
				const { data: summaryData, error: summaryError } = await supabase
					.from("summaries")
					.select("content")
					.eq("document_id", documentId)
					.single();

				if (!summaryError && summaryData?.content) {
					return { content: summaryData.content, isSummary: true };
				}

				// If no summary, fetch the full document content
				const { data: documentData, error: documentError } = await supabase
					.from("documents")
					.select("content")
					.eq("id", documentId)
					.eq("user_id", userId)
					.single();

				if (documentError) {
					throw new Error(`Failed to fetch document: ${documentError.message}`);
				}

				return { content: documentData?.content ?? "", isSummary: false };
			});

			const { content, isSummary } = documentData;
			tokenTracker.trackTokens("document_content", content);
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 3. Generate the flash cards
			const flashCards = await step.run("generate-flash-cards", async () => {
				let contextContent = content;

				if (!isSummary) {
					// Use RAG to get important parts of the main document
					const splitter = new CharacterTextSplitter({
						chunkSize: 1000,
						chunkOverlap: 200
					});
					const chunks = await splitter.createDocuments([content]);

					const promptTemplate = PromptTemplate.fromTemplate(
						"Extract the most important information from the following text:\n\n{context}\n\nProvide a concise summary of the key points."
					);

					const questionAnswerChain = await createStuffDocumentsChain({
						llm: model,
						prompt: promptTemplate
					});

					const result = await questionAnswerChain.invoke({
						context: chunks
					});

					contextContent = result.toString();
				}

				const metaPrompt = generateFlashCardsMetaPrompt(
					documentType,
					academicLevel,
					subject
				);

				const promptTemplate = PromptTemplate.fromTemplate(metaPrompt);
				const prompt = await promptTemplate.format({ summary: contextContent });

				const result = await model.invoke(prompt);
				// @ts-ignore
				const generatedJSONString = result?.content?.toString();

				try {
					const flashCardsData: { data: FlashCardData[] } = JSON.parse(
						generatedJSONString ?? "{}"
					);
					return { result, generatedJSONString, flashCardsData, prompt };
				} catch (error: any) {
					console.error("Error parsing flash cards JSON:", error);
					throw new Error(error);
				}
			});

			const { generatedJSONString, prompt, flashCardsData } = flashCards;
			tokenTracker.trackTokens("flash_cards_data", generatedJSONString);
			tokenTracker.trackTokens("flash_cards_prompt", prompt);
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 4. Delete previous flash cards for the document and store the new ones
			const storedFlashCards = await step.run("store-flash-cards", async () => {
				const { error: deleteError } = await supabase
					.from("flash_cards")
					.delete()
					.eq("document_id", documentId)
					.eq("user_id", userId);

				if (deleteError) {
					throw new Error(
						`Failed to delete previous flash cards: ${deleteError.message}`
					);
				}

				const { data: insertedFlashCardsData, error: insertError } =
					await supabase
						.from("flash_cards")
						.insert({
							user_id: userId,
							document_id: documentId,
							data: flashCardsData?.data ?? []
						})
						.select("*");

				if (insertError) {
					throw insertError;
				}

				return insertedFlashCardsData;
			});

			// 5. Update the flash cards status to complete
			await step.run("update-flash-cards-status", async () => {
				const { data: flashCardsData, error: updateError } = await supabase
					.from("documents")
					.update({ flash_cards_status: "completed" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("flash_cards_status");

				if (updateError) {
					throw updateError;
				}

				return flashCardsData;
			});

			// 6. Update the status of the transaction to completed
			await step.run("update-transaction-status", async () => {
				const { data: transactionData, error: updateError } = await supabase
					.from("transactions")
					.update({ status: "successful" })
					.eq("id", transactionId);

				if (updateError) {
					throw updateError;
				}

				return transactionData;
			});

			const totalTokens = Object.values(tokenCounts).reduce((a, b) => a + b, 0);

			return {
				event,
				body: {
					success: true,
					flashCards: storedFlashCards,
					flashCardsId: storedFlashCards?.[0]?.id,
					tokenCounts,
					totalTokens
				}
			};
		} catch (error: any) {
			if (error.message !== "Insufficient credits") {
				// 1. Restore credits if an error occurs
				await supabase.rpc("add_credits", {
					p_user_id: userId,
					p_amount: credits
				});

				// 2. Update the status of the flash cards generation to failed
				await supabase
					.from("documents")
					.update({ flash_cards_status: "failed" })
					.eq("id", documentId)
					.eq("user_id", userId);

				// 3. Update the status of the transaction to failed
				await supabase
					.from("transactions")
					.update({ status: "failed" })
					.eq("id", transactionId);
			}

			console.error("Error in generateFlashCards:", error);
			throw new Error(error instanceof Error ? error.message : String(error));
		} finally {
			tokenTracker.free();
		}
	}
);
