import { Readable } from "stream";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "csv", "txt", "log"];

function allowedFile(filename: string): boolean {
	return (
		filename.includes(".") &&
		ALLOWED_EXTENSIONS.includes(filename.split(".").pop()!.toLowerCase())
	);
}

async function extractTextFromFile(
	fileStream: Readable,
	fileType: string
): Promise<string> {
	switch (fileType) {
		case "pdf":
			return extractTextFromPDF(fileStream);
		case "docx":
			return extractTextFromDOCX(fileStream);
		case "txt":
		case "log":
		case "csv":
			return streamToString(fileStream);
		default:
			throw new Error("Unsupported file type");
	}
}

async function extractTextFromPDF(fileStream: Readable): Promise<string> {
	return new Promise(async (resolve, reject) => {
		const pdfParser = new PDFParser(null, true);

		pdfParser.on("pdfParser_dataReady", pdfData => {
			let textContent = "";

			for (let i = 0; i < pdfData.Pages.length; i++) {
				let pageText = "";
				for (let j = 0; j < pdfData.Pages[i].Texts.length; j++) {
					pageText += decodeURIComponent(pdfData.Pages[i].Texts[j].R[0].T);
				}
				// Replace multiple spaces with a single space
				pageText = pageText.replace(/\s+/g, " ");
				// Add newline after each page
				textContent += pageText.trim() + "\n\n";
			}

			console.log("Extracted text content length:", textContent.length);
			resolve(textContent.trim());
		});

		pdfParser.on("pdfParser_dataError", (error: any) => {
			console.error("Error extracting PDF:", error);
			reject(new Error(`PDF extraction failed: ${error.message}`));
		});

		try {
			console.log("Starting PDF parsing");
			const buffer = await streamToBuffer(fileStream);
			pdfParser.parseBuffer(buffer);
		} catch (error) {
			reject(new Error(`Error converting stream to buffer: ${error}`));
		}
	});
}

async function extractTextFromDOCX(fileStream: Readable): Promise<string> {
	const result = await mammoth.extractRawText({
		buffer: await streamToBuffer(fileStream)
	});
	return result.value.trim();
}

async function streamToString(stream: Readable): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk));
	}
	return Buffer.concat(chunks).toString("utf-8");
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}

export {
	allowedFile,
	extractTextFromFile,
	extractTextFromPDF,
	extractTextFromDOCX
};
