import { v5 as uuidv5 } from "uuid";

const UUID_NAMESPACE = process.env.NEXT_PUBLIC_UUID_NAMESPACE;

function convertClerkIdToUUID(clerkId?: string | null): string {
	if (!UUID_NAMESPACE) {
		throw new Error("UUID_NAMESPACE is not set");
	}

	if (!clerkId) {
		throw new Error("Clerk ID is not set");
	}

	return uuidv5(clerkId, UUID_NAMESPACE);
}

export { convertClerkIdToUUID };
