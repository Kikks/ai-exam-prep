import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// This function formats numbers to shorter format
// eg 100000 -> 100K
// If the number is a perfect multiple of 1000, it will not show the decimal point
export function formatNumber(num: number) {
	const isMultipleOf100 = num % 100 === 0;

	if (num >= 1000000000) {
		return (num / 1000000000).toFixed(isMultipleOf100 ? 0 : 1) + "B";
	} else if (num >= 1000000) {
		return (num / 1000000).toFixed(isMultipleOf100 ? 0 : 1) + "M";
	} else if (num >= 1000) {
		return (num / 1000).toFixed(isMultipleOf100 ? 0 : 1) + "K";
	} else {
		return num.toString();
	}
}

export function getFileType(fileType?: string) {
	switch (fileType) {
		case "application/pdf":
			return "pdf";
		case "application/msword":
			return "docx";
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			return "docx";
		case "text/csv":
			return "csv";
		case "text/plain":
			return "txt";
		default:
			return null;
	}
}

export function getGreetings() {
	const date = new Date();
	const hour = date.getHours();

	if (hour >= 5 && hour < 12) {
		return "Good morning";
	} else if (hour >= 12 && hour < 18) {
		return "Good afternoon";
	} else {
		return "Good evening";
	}
}
