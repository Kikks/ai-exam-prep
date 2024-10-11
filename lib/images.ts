import { shapes } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

type Shape =
	| "ellipse"
	| "ellipseFilled"
	| "line"
	| "polygon"
	| "polygonFilled"
	| "rectangle"
	| "rectangleFilled";

const possibleShapes: Shape[] = [
	"ellipse",
	"ellipseFilled",
	"line",
	"polygon",
	"polygonFilled",
	"rectangle",
	"rectangleFilled"
];

function generateRandomShapes(): Shape[] {
	return Array(7).fill(
		possibleShapes[Math.floor(Math.random() * possibleShapes.length)]
	);
}

function generateRandomColorHex(): string {
	return `${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function generateRandomColors(): string[] {
	return Array(7).fill(generateRandomColorHex());
}

export function generateImage() {
	const avatar = createAvatar(shapes, {
		backgroundColor: generateRandomColors(),
		backgroundType: ["gradientLinear", "solid"],
		randomizeIds: true,
		shape1: generateRandomShapes(),
		shape1Color: generateRandomColors(),
		shape2: generateRandomShapes(),
		shape2Color: generateRandomColors(),
		shape3: generateRandomShapes(),
		shape3Color: generateRandomColors()
	});

	const imageUrl = avatar.toDataUri();
	return imageUrl;
}
