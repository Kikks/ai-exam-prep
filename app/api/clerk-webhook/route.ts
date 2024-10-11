import { Webhook } from "svix";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@clerk/nextjs/server";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const config = {
	api: {
		bodyParser: false
	}
};

export async function GET() {
	return NextResponse.json({
		message: "Hello World"
	});
}

export async function POST(req: NextRequest) {
	const payload = await req.text();
	const headers = Object.fromEntries(req.headers);
	const wh = new Webhook(webhookSecret as string);
	let evt: Event;

	try {
		evt = wh.verify(payload, headers) as Event;
	} catch (err) {
		console.error("Error verifying webhook:", err);
		return NextResponse.json(
			{ error: "Error verifying webhook" },
			{ status: 400 }
		);
	}

	// @ts-expect-error - TODO: fix this
	const { id: clerkId, email_addresses } = evt?.data as User;
	const email = email_addresses?.[0]?.email_address;
	const id = convertClerkIdToUUID(clerkId);

	if (!email) {
		return NextResponse.json(
			{ error: "User email not found" },
			{ status: 400 }
		);
	}

	if (evt.type === "user.created") {
		const { error } = await supabase
			.from("users")
			.insert({ id, email })
			.single();

		if (error) {
			console.error("Error inserting user:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	} else if (evt.type === "user.updated") {
		const { error } = await supabase
			.from("users")
			.update({ email })
			.match({ id });

		if (error) {
			console.error("Error updating user:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	} else if (evt.type === "user.deleted") {
		const { error } = await supabase.from("users").delete().match({ id });

		if (error) {
			console.error("Error deleting user:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}

	return NextResponse.json({
		received: true,
		user: { id, email },
		event: evt.type
	});
}
