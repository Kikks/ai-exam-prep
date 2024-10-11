/* eslint-disable @typescript-eslint/ban-ts-comment */
import { inngest } from "@/lib/inngest";

export const sayHello = inngest.createFunction(
	{ id: "say-hello" },
	{ event: "say-hello" },
	async ({ event, step }) => {
		step.sleep({ name: "chill", id: "chill-id" }, 1000);
		return {
			event,
			body: {
				message: "Hello, World!"
			}
		};
	}
);
