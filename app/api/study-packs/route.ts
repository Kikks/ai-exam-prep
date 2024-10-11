import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
	const { data, error } = await supabase.from("study_packs").select("*");

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data);
}

export async function POST(request: Request) {
	const { title, description, content, user_id } = await request.json();

	const { data, error } = await supabase
		.from("study_packs")
		.insert({ title, description, content, user_id })
		.select();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(data, { status: 201 });
}
