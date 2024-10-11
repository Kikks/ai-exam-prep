import { summarizeDocument } from "./summarizeDocument";
import { generateMindMap } from "./generateDocumentMindMap";
import { generateFlashCards } from "./generateDocumentFlashCards";
import { sayHello } from "./sayHello";

const inngestFunctions = [
	sayHello,
	summarizeDocument,
	generateMindMap,
	generateFlashCards
];

export default inngestFunctions;
