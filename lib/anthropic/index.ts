import AnthropicClient from "@anthropic-ai/sdk";

const anthropic = new AnthropicClient({
	apiKey: process.env.ANTHROPIC_API_KEY
});

export default anthropic;
