import { supabase } from "@/lib/supabase";
import { calculateSummarizationCredits } from "@/lib/tokens";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const documentId = searchParams.get("documentId") as string;
	const userId = searchParams.get("userId") as string;

	const { data, error } = await supabase
		.from("documents")
		.select("content")
		.eq("id", documentId)
		.eq("user_id", userId)
		.single();

	if (error) {
		return NextResponse.json(
			{ error: error?.message || "Failed to calculate cost" },
			{ status: 500 }
		);
	}

	const credits = await calculateSummarizationCredits(data?.content ?? "");
	return NextResponse.json({ credits }, { status: 200 });
}
