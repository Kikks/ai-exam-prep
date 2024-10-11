export const SUPABASE_TABLES = {
	STUDY_PACKS: "study_packs",
	STUDY_PACK_ITEMS: "study_pack_items",
	USERS: "users"
};

export const SUPABASE_CONFIG = {
	SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
	SUPABASE_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET
};

export const CLOUDINARY_CONFIG = {
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

export const RANDOM_IMAGE_URLS = [
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=cellular-automata&cells=10",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=triangles&gap=100",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=mondrian",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=tiles",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=cubic-disarray",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=joy-division",
	"https://generative-placeholders.glitch.me/image?width=300&height=300&style=circles"
];

export const SUPPORTED_FILE_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"text/csv",
	"text/plain"
];

export const ACADEMIC_LEVELS = [
	{ value: "high_school", label: "High School" },
	{ value: "undergraduate", label: "Undergraduate" },
	{ value: "graduate", label: "Graduate" },
	{ value: "phd", label: "PhD" }
];

export const SUBJECTS = [
	{ value: "general", label: "General" },
	{ value: "stem", label: "STEM (Science, Technology, Engineering, Math)" },
	{
		value: "humanities",
		label: "Humanities (History, Literature, Philosophy, etc.)"
	},
	{
		value: "social_sciences",
		label: "Social Sciences (Psychology, Sociology, etc.)"
	},
	{ value: "arts", label: "Arts (Music, Visual, Performing, etc.)" },
	{
		value: "business",
		label: "Business (Finance, Marketing, Management, etc.)"
	},
	{ value: "law", label: "Law (Constitutional, Criminal, Civil, etc.)" },
	{
		value: "education",
		label: "Education (Teaching, Curriculum, etc.)"
	}
];

export const CREDIT_RATE_PER_NAIRA = 7.5; // 7.5 credits for 1 naira
export const MIN_CREDITS_TO_BUY_IN_NAIRA = 500;

export const NAIRA_PER_USD = 1700;

// Claude 3.5 Sonnet is $15 per 1,000,000 tokens output tokens
// and $35 per 1,000,000 input tokens.
// The cost below is like an estimate of the cost per token
export const USD_COST_PER_TOKEN = 6 / 1000000;
export const USD_COST_PER_TOKEN_FOR_MIND_MAP = 10 / 1000000;
export const USD_COST_PER_TOKEN_FOR_FLASHCARDS = 15 / 1000000;
