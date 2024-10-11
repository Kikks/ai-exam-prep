/* eslint-disable @typescript-eslint/ban-ts-comment */
import { CharacterTextSplitter } from "langchain/text_splitter";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "langchain/document";

import { inngest } from "@/lib/inngest";
import { supabase } from "@/lib/supabase";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { generateDocumentSummaryMetaPrompt } from "@/lib/prompts";
import { createTokenTracker } from "@/lib/tokens";

const model = new ChatAnthropic({ modelName: "claude-3-5-sonnet-20240620" });

export const summarizeDocument = inngest.createFunction(
	{ id: "summarize-document" },
	{ event: "document/summarize" },
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
			// 1. Update the status of the summarization to in_progress
			await step.run("update-document-summary-status", async () => {
				const { data: documentData, error: updateError } = await supabase
					.from("documents")
					.update({ summary_status: "in_progress" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("summary_status");

				if (updateError) {
					throw new Error(
						`Failed to update document summary status: ${updateError.message}`
					);
				}

				return documentData;
			});

			// 2. Get the document content from Supabase
			const documentData = await step.run("fetch-document", async () => {
				const { data: documentData, error: documentError } = await supabase
					.from("documents")
					.select("content")
					.eq("id", documentId)
					.eq("user_id", userId)
					.single();

				if (documentError) {
					throw new Error(`Failed to fetch document: ${documentError.message}`);
				}

				return documentData;
			});

			const content = documentData?.content ?? "";
			tokenTracker.trackTokens("document_content", content);
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 3. Split the document into chunks
			const chunks = await step.run("split-document", async () => {
				const splitter = new CharacterTextSplitter({
					chunkSize: 2000, // Increased from 1000
					chunkOverlap: 200
				});
				return await splitter.createDocuments([content]);
			});

			// 4. Summarize each chunk using the metaprompt
			const chunkSummaries = await step.run("summarize-chunks", async () => {
				const metaPrompt = generateDocumentSummaryMetaPrompt(
					documentType,
					academicLevel,
					subject
				);

				const summaries = await Promise.all(
					chunks.map(async (chunk, index) => {
						const prompt = `${metaPrompt}\n\nThis is part ${index + 1} of ${
							chunks.length
						} of the document. Summarize the following text:\n${
							chunk.pageContent
						}`;
						const summary = await model.invoke(prompt);
						return { summary, prompt };
					})
				);

				return summaries;
			});

			// Update token counts after the step
			chunkSummaries.forEach(({ summary, prompt }) => {
				tokenTracker.trackTokens("chunk_prompt", prompt);
				// @ts-ignore
				tokenTracker.trackTokens("chunk_summary", summary.kwargs?.content);
			});
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 5. Combine summaries
			const finalSummary = await step.run(
				"generate-final-summary",
				async () => {
					const promptTemplate = PromptTemplate.fromTemplate(
						generateDocumentSummaryMetaPrompt(
							documentType,
							academicLevel,
							subject
						) +
							"\n\nThis is a summary of the entire document, compiled from individual chunk summaries. Get straight to the summary, no yapping. Use this information to create a comprehensive summary:\n\n{context}"
					);

					const questionAnswerChain = await createStuffDocumentsChain({
						llm: model,
						prompt: promptTemplate
					});

					const chunkSummaryDocs = chunkSummaries.map(({ summary }, index) => {
						const doc = new Document({
							// @ts-ignore
							pageContent: summary.kwargs?.content ?? "",
							metadata: { chunk: index + 1 }
						});
						return doc;
					});

					const result = await questionAnswerChain.invoke({
						context: chunkSummaryDocs,
						input:
							"Based on the provided summaries, create a comprehensive summary of the entire document, highlighting the main points and key takeaways. Ensure that you cover all major sections of the document and provide a coherent overview."
					});

					return { prompt: promptTemplate.template.toString(), result };
				}
			);

			// Update token counts after the step
			tokenTracker.trackTokens("final_prompt_template", finalSummary.prompt);
			tokenTracker.trackTokens("final_summary", finalSummary.result);
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 6. Delete previous summaries for the document and store the final summary
			const summaryData = await step.run("store-final-summary", async () => {
				const { error: deleteError } = await supabase
					.from("summaries")
					.delete()
					.eq("document_id", documentId)
					.eq("user_id", userId);

				if (deleteError) {
					throw new Error(
						`Failed to delete previous summaries: ${deleteError.message}`
					);
				}

				const { data: summaryData, error: insertError } = await supabase
					.from("summaries")
					.insert({
						document_id: documentId,
						user_id: userId,
						content: finalSummary.result
					})
					.select("*");

				if (insertError) {
					throw new Error(`Failed to store summary: ${insertError.message}`);
				}

				return summaryData;
			});

			// 7. Update the status of the summarization to completed
			await step.run("update-document-summary-status", async () => {
				const { data: documentData, error: updateError } = await supabase
					.from("documents")
					.update({ summary_status: "completed" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("summary_status");

				if (updateError) {
					throw new Error(
						`Failed to update document summary status: ${updateError.message}`
					);
				}

				return documentData;
			});

			// 8. Update the status of the transaction to completed
			await step.run("update-transaction-status", async () => {
				const { data: transactionData, error: updateError } = await supabase
					.from("transactions")
					.update({ status: "successful" })
					.eq("id", transactionId);

				if (updateError) {
					throw new Error(
						`Failed to update transaction status: ${updateError.message}`
					);
				}

				return transactionData;
			});

			const totalTokens = Object.values(tokenCounts).reduce((a, b) => a + b, 0);

			return {
				event,
				body: {
					generatedSummary: finalSummary,
					success: true,
					tokenCounts,
					totalTokens,
					summaryId: summaryData?.[0]?.id
				}
			};
		} catch (error: any) {
			if (error.message !== "Insufficient credits") {
				// 1. Restore credits if an error occurs
				await supabase.rpc("add_credits", {
					p_user_id: userId,
					p_amount: credits
				});

				// 2. Update the status of the summarization to failed
				await supabase
					.from("documents")
					.update({ summary_status: "failed" })
					.eq("id", documentId)
					.eq("user_id", userId);

				// 3. Update the status of the transaction to failed
				await supabase
					.from("transactions")
					.update({ status: "failed" })
					.eq("id", transactionId);
			}

			console.error("Error in summarizeDocument:", error);
			throw new Error(error instanceof Error ? error.message : String(error));
		}
	}
);
