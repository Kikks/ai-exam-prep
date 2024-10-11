import type { Database } from "@/lib/supabase/database.types";

type Tables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Row"];

export type User = Tables<"users">;
export type StudyPack = Tables<"study_packs">;
export type Document = Tables<"documents">;
export type Summary = Tables<"summaries">;
export type MindMap = Tables<"mind_maps">;
export type FlashCard = Tables<"flash_cards">;
export type TestSimulation = Tables<"exams">;
export type UserCredit = Tables<"user_credits">;
export type CreditTransaction = Tables<"transactions">;
export type DatabaseEnums = Database["public"]["Enums"];

export interface DatabaseStudyPack extends StudyPack {
	documents: Document[];
	mind_maps: MindMap[];
	test_simulations: TestSimulation[];
}

export interface DatabaseDocument extends Document {
	summaries: Summary[];
	mind_maps: MindMap[];
}

export type TreeNode = {
	name: string;
	children?: TreeNode[];
};

export type MindMapData = {
	data: TreeNode;
};

export type FlashCardData = {
	question: string;
	answer: string;
	difficulty: "easy" | "medium" | "hard";
};
