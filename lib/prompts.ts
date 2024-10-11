export function generateDocumentSummaryMetaPrompt(
	documentType: string,
	academicLevel: string,
	subject: string
) {
	return `
As an expert educator in ${subject}, create a comprehensive summary of this ${academicLevel}-level ${documentType}. Follow these guidelines:

1. Structure:
   a. Brief introduction (1-2 sentences on main topic)
   b. Main body (organized by key themes, use clear headings)
   c. Conclusion (1-2 sentences on core takeaways)

2. Content:
   a. Identify and explain 5-7 key concepts
   b. Include critical formulas, equations, or methodologies with brief explanations
   c. Highlight important examples, case studies, dates, or figures
   d. List any significant debates or unanswered questions in the field

3. Format:
   a. Use bullet points for easy scanning
   b. Limit to 15% of original content length
   c. Employ clear, ${academicLevel}-appropriate language

4. Learning Aids:
   a. Create a glossary of 5-10 essential terms with concise definitions
   b. Suggest 3-5 potential quiz questions on core content

5. Connections:
   a. Briefly note relationships between main concepts
   b. Mention real-world applications or interdisciplinary links

6. Review:
   After drafting, refine the summary by considering:
   - Are the 3-5 most crucial points clearly emphasized?
   - Can any part be more concise without losing essential information?
   - Does the summary provide a solid foundation for flashcard and mind map creation?

Your goal is to create a summary that not only aids understanding and retention but also serves as an excellent basis for developing effective study tools.`;
}

export function generateMindMapMetaPrompt(
	documentType: string,
	academicLevel: string,
	subject: string
) {
	return `
As an expert in ${subject} education, create a comprehensive mind map from this ${academicLevel}-level ${documentType} summary:

{summary}

Guidelines:
1. Root: Main topic of the ${documentType}.
2. Structure: Hierarchical, reflecting key concepts and their relationships.
3. Depth: Expand to capture all crucial details, typically 3-5 levels deep.
4. Node naming: Concise yet descriptive; use keywords for easy recall.
5. Connections: Show relationships between concepts across branches where relevant.
6. Balance: Aim for 3-7 main branches from the root for optimal organization.
7. Academic focus: 
   - Include definitions, theories, and principles as second-level nodes.
   - Add examples, applications, and case studies as deeper-level nodes.
   - For STEM subjects, incorporate formulas and key equations.
8. Visual cues: Suggest icons or symbols for main concepts (e.g., [FORMULA], [EXAMPLE], [THEORY]).
9. Review points: Add nodes for potential quiz questions or exam topics.
10. The output should be a valid JSON object matching this TypeScript type:

type TreeNode = {{ name: string; children?: TreeNode[] }};

type MindMap = {{ data: TreeNode }};

Remember, the mind map should be detailed and can go as many levels deep as necessary to accurately represent the document's content.

Now, based on the following document summary, create a comprehensive mind map structure:

{summary}

Provide only the JSON output for the mind map, without any additional explanation.
`;
}

export function generateFlashCardsMetaPrompt(
	documentType: string,
	academicLevel: string,
	subject: string,
	numberOfCards: number = 20
) {
	return `
You are an expert AI tutor specializing in creating highly effective flashcards for ${academicLevel} level ${subject} based on ${documentType} summaries. Your task is to generate a set of ${numberOfCards} flashcards that will significantly enhance the student's understanding and retention of key concepts. Follow these guidelines meticulously:

1. Content and Structure:
   - Create exactly ${numberOfCards} flashcards, each containing a question, an answer, and a category.
   - Ensure questions are concise, thought-provoking, and directly related to core concepts from the ${documentType}.
   - Organize flashcards into logical categories or themes that reflect the structure of the ${subject} at ${academicLevel} level.

2. Cognitive Engagement:
   - Incorporate a variety of question types to promote different cognitive processes:
     a) Factual recall questions for foundational knowledge.
     b) Conceptual understanding questions to test grasp of underlying principles.
     c) Application questions to assess ability to use knowledge in new contexts.
     d) Analysis questions to encourage critical thinking and comparison.

3. Language and Clarity:
   - Use clear, concise language appropriate for ${academicLevel} level in ${subject}.
   - Define any technical terms or jargon that may be unfamiliar to students at this level.
   - Ensure questions and answers are unambiguous and self-contained.

4. Learning Optimization:
   - Focus on the most crucial and frequently tested concepts in ${subject} at ${academicLevel} level.
   - Include mnemonics, acronyms, or other memory aids where appropriate.
   - For mathematical or scientific subjects, include formula-based questions and their applications.

5. Difficulty Calibration:
   - Vary the difficulty of questions to challenge students while maintaining confidence:
     - 20% foundational questions (easy)
     - 60% reinforcement questions (medium)
     - 20% extension questions (challenging)

6. Interconnectedness:
   - Create some flashcards that connect multiple concepts or themes within the ${subject}.
   - Include compare and contrast questions to highlight relationships between different topics.

7. Metadata and Structure:
   - The output should be a valid JSON object matching this TypeScript type:
     type FlashCardData = {{ question: string; answer: string; difficulty: "easy" | "medium" | "hard" }};
     type FlashCards = {{ data: FlashCardData[] }};

Now, based on the following ${documentType} summary for ${academicLevel} level ${subject}, create a comprehensive set of ${numberOfCards} flashcards adhering to the above guidelines:

{summary}

Provide only the JSON output for the flashcards, without any additional explanation. Ensure the output is valid JSON that can be parsed without errors.
`;
}
