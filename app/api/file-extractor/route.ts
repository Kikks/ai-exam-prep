import { NextRequest, NextResponse } from "next/server";
import { allowedFile, extractTextFromFile } from "@/lib/file-extraction";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const filename = file.name;
		if (!allowedFile(filename)) {
			return NextResponse.json(
				{ error: "File type not allowed" },
				{ status: 400 }
			);
		}

		const fileType = filename.split(".").pop()!.toLowerCase();
		const fileBuffer = await file.arrayBuffer();
		const fileStream = Readable.from(Buffer.from(fileBuffer));

		const extractedText = await extractTextFromFile(fileStream, fileType);

		return NextResponse.json({ text: extractedText }, { status: 200 });
	} catch (error: any) {
		console.error("Error processing file:", error);
		return NextResponse.json(
			{ error: `Error processing file: ${error.message}` },
			{ status: 500 }
		);
	}
}
