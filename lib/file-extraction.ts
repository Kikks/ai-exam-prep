import * as fs from "fs";
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
	filePath: string,
	fileType: string
): Promise<string> {
	switch (fileType) {
		case "pdf":
			return extractTextFromPDF(filePath);
		case "docx":
			return extractTextFromDOCX(filePath);
		case "txt":
		case "log":
		case "csv":
			return fs.readFileSync(filePath, "utf-8");
		default:
			throw new Error("Unsupported file type");
	}
}

async function extractTextFromPDF(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
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

		console.log("Starting PDF parsing for file:", filePath);
		pdfParser.loadPDF(filePath);
	});
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
	const result = await mammoth.extractRawText({ path: filePath });
	return result.value.trim();
}

export {
	allowedFile,
	extractTextFromFile,
	extractTextFromPDF,
	extractTextFromDOCX
};
