import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { supabase } from "@/lib/supabase";
import { calculateSummarizationCredits } from "@/lib/tokens";

export async function POST(req: Request) {
	const { documentId, userId, documentType, academicLevel, subject } =
		await req.json();
	let credits: number = 0;
	let transactionId: string | null = null;

	try {
		// Fetch document
		const { data: document, error: documentError } = await supabase
			.from("documents")
			.select("content, title")
			.eq("id", documentId)
			.eq("user_id", userId)
			.single();

		if (documentError) {
			console.error(documentError);
			throw new Error("Document does not exist");
		}

		// Fetch user credits
		const { data: userCreditData, error: userCreditError } = await supabase
			.from("user_credits")
			.select("balance")
			.eq("user_id", userId)
			.single();

		if (userCreditError) {
			console.error(userCreditError);
			throw new Error("User does not have credits");
		}

		// Calculate and check credits
		credits = await calculateSummarizationCredits(document.content ?? "");
		if (userCreditData.balance < credits)
			throw new Error("Insufficient credits");

		// Deduct credits
		const { error: creditsDeductionError } = await supabase.rpc("use_credits", {
			p_user_id: userId,
			p_amount: credits
		});

		if (creditsDeductionError) {
			console.error(creditsDeductionError);
			throw new Error("Failed to deduct credits");
		}

		// Record transaction
		const { data: transactionData, error: transactionError } = await supabase
			.from("transactions")
			.insert({
				amount: credits,
				description: `Summarization of document - ${
					document.title ?? documentId
				}`,
				type: "credit_usage",
				status: "in_progress",
				user_id: userId
			})
			.select("id");

		if (transactionError) {
			console.error(transactionError);
			throw new Error("Failed to record transaction");
		}

		transactionId = transactionData[0].id;

		// Trigger summarization
		await inngest.send({
			name: "document/summarize",
			data: {
				documentId,
				userId,
				credits,
				transactionId: transactionData[0].id,
				documentType: documentType ?? "Study Note",
				academicLevel: academicLevel ?? "Undergraduate",
				subject: subject ?? "General"
			}
		});

		return NextResponse.json(
			{ message: "Summarization initiated" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error(error);
		if (
			error.message !== "Insufficient credits" &&
			error.message !== "User does not have credits"
		) {
			await supabase.rpc("add_credits", {
				p_user_id: userId,
				p_amount: credits
			});
		}

		if (transactionId) {
			await supabase
				.from("transactions")
				.update({
					status: "failed"
				})
				.eq("id", transactionId);
		}

		return NextResponse.json({ message: error.message }, { status: 400 });
	}
}
