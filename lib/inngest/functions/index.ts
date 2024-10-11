import { summarizeDocument } from "./summarizeDocument";
import { generateMindMap } from "./generateDocumentMindMap";
import { generateFlashCards } from "./generateDocumentFlashCards";

const inngestFunctions = [
	summarizeDocument,
	generateMindMap,
	generateFlashCards
];

export default inngestFunctions;
