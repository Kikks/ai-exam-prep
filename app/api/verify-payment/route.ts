import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";
import { CREDIT_RATE_PER_NAIRA } from "@/lib/constants";

export async function POST(req: NextRequest) {
	const { reference, userId } = await req.json();

	try {
		const { data } = await verifyPayment(reference);

		if (data?.data) {
			const amountPaidInNaira = data.data.amount / 100;
			const creditsToAdd = amountPaidInNaira * CREDIT_RATE_PER_NAIRA;

			const { error } = await supabase.rpc("add_credits", {
				p_user_id: userId,
				p_amount: creditsToAdd
			});

			if (error) {
				// TODO: Refund user
				throw new Error(error.message);
			}

			const { error: transactionError } = await supabase
				.from("transactions")
				.insert({
					user_id: userId,
					amount: amountPaidInNaira,
					description: "Credit Top-up",
					type: "payment",
					status: "successful"
				});

			if (transactionError) {
				// TODO: Refund user
				throw new Error(transactionError.message);
			}

			return NextResponse.json(
				{
					message: "Payment verified and credits added",
					creditsAdded: creditsToAdd
				},
				{ status: 200 }
			);
		}
	} catch (error: any) {
		console.error(error);
		return NextResponse.json(
			{ error: error?.message || "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
