import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import * as fs from "fs";
import path from "path";
import { Buffer } from "buffer";
import { allowedFile, extractTextFromFile } from "@/lib/file-extraction";

export async function POST(request: NextRequest) {
	let filePath: string | undefined;

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

		// Create a temporary file path
		const tempDir = path.join(process.cwd(), "tmp");

		// Ensure the temporary directory exists
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		filePath = path.join(tempDir, filename);

		// Write the file to the temporary directory
		const fileBuffer = await file.arrayBuffer();
		await writeFile(filePath, Buffer.from(fileBuffer));

		const fileType = filename.split(".").pop()!.toLowerCase();
		const extractedText = await extractTextFromFile(filePath, fileType);

		return NextResponse.json({ text: extractedText }, { status: 200 });
	} catch (error: any) {
		console.error("Error processing file:", error);
		return NextResponse.json(
			{ error: `Error processing file: ${error.message}` },
			{ status: 500 }
		);
	} finally {
		// Delete the temporary file
		if (filePath) {
			fs.unlinkSync(filePath);
		}
	}
}
