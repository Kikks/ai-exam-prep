import { Home, Package, Library } from "lucide-react";

const sidebarLinks = [
	{
		name: "Home",
		href: "/dashboard",
		icon: Home
	},
	{
		name: "Study Packs",
		href: "/dashboard/study-packs",
		icon: Package
	},
	{
		name: "Library",
		href: "/dashboard/library",
		icon: Library
	}
];

export { sidebarLinks };
