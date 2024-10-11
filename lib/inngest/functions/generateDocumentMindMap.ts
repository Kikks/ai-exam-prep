/* eslint-disable @typescript-eslint/ban-ts-comment */
import { inngest } from "@/lib/inngest";
import { generateMindMapMetaPrompt } from "@/lib/prompts";
import { supabase } from "@/lib/supabase";
import { createTokenTracker } from "@/lib/tokens";
import { MindMapData } from "@/types";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const model = new ChatAnthropic({ modelName: "claude-3-5-sonnet-20240620" });

export const generateMindMap = inngest.createFunction(
	{ id: "generate-mind-map" },
	{ event: "document/generate-mind-map" },
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
			// 1. Update the status of the mind map generation to in_progress
			await step.run("update-mind-map-status", async () => {
				const { data: mindMapData, error: updateError } = await supabase
					.from("documents")
					.update({ mind_map_status: "in_progress" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("mind_map_status");

				if (updateError) {
					new Error(`Failed to update mind map status: ${updateError.message}`);
				}

				return mindMapData;
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

			// 3. Generate the mind map
			const mindMap = await step.run("generate-mind-map", async () => {
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

				const metaPrompt = generateMindMapMetaPrompt(
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
					const mindMapData: MindMapData = JSON.parse(
						generatedJSONString ?? "{}"
					);
					return { result, generatedJSONString, mindMapData, prompt };
				} catch (error: any) {
					console.error("Error parsing mind map JSON:", error);
					throw new Error(error);
				}
			});

			const { generatedJSONString, prompt, mindMapData } = mindMap;
			tokenTracker.trackTokens("mind_map_data", generatedJSONString);
			tokenTracker.trackTokens("mind_map_prompt", prompt);
			tokenCounts = { ...tokenCounts, ...tokenTracker.getTokenCounts() };

			// 4. Delete previous mind maps for the document and store the final mind map
			const storedMindMap = await step.run("store-final-mind-map", async () => {
				const { error: deleteError } = await supabase
					.from("mind_maps")
					.delete()
					.eq("document_id", documentId)
					.eq("user_id", userId);

				if (deleteError) {
					throw new Error(
						`Failed to delete previous mind maps: ${deleteError.message}`
					);
				}

				const { data: insertedMindMapData, error: insertError } = await supabase
					.from("mind_maps")
					.insert({
						document_id: documentId,
						user_id: userId,
						data: mindMapData?.data ?? {}
					})
					.select("*");

				if (insertError) {
					throw insertError;
				}

				return insertedMindMapData;
			});

			// 5. Update the mind map status to complete
			await step.run("update-mind-map-status", async () => {
				const { data: mindMapData, error: updateError } = await supabase
					.from("documents")
					.update({ mind_map_status: "completed" })
					.eq("id", documentId)
					.eq("user_id", userId)
					.select("mind_map_status");

				if (updateError) {
					throw updateError;
				}

				return mindMapData;
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
					mindMap: storedMindMap,
					mindMapId: storedMindMap?.[0]?.id,
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

			console.error("Error in generateMindMap:", error);
			throw new Error(error instanceof Error ? error.message : String(error));
		} finally {
			tokenTracker.free();
		}
	}
);
