"use server";

export async function cleanText(text: string): Promise<string> {
	// Remove specific problematic characters
	const cleanedText = text
		.replace(/\u0000/g, "") // Remove null character
		.replace(/\u001F/g, "") // Remove unit separator
		.replace(/\u007F/g, ""); // Remove delete character

	// // Remove other control characters (except newline and tab)
	// cleanedText = cleanedText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

	// Replace non-printable characters with space
	// cleanedText = cleanedText.replace(/[^\x20-\x7E\n\t]/g, " ");

	// Normalize whitespace (replace multiple spaces with single space)
	// cleanedText = cleanedText.replace(/\s+/g, " ").trim();

	return cleanedText;
}
