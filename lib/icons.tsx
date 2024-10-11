import { Icon } from "@iconify/react/dist/iconify.js";

const IconComponent = ({
	icon,
	className
}: {
	icon: string;
	className?: string;
}) => (
	<Icon icon={icon} className={`text-2xl text-gray-500 ${className || ""}`} />
);

const getFileTypeIcon = (
	fileType: string = "",
	options?: {
		className?: string;
	}
) => {
	const { className } = options || { className: "" };

	switch (fileType) {
		case "pdf":
			return <IconComponent icon='ph:file-pdf-duotone' className={className} />;
		case "docx":
			return <IconComponent icon='ph:file-doc-duotone' className={className} />;
		case "csv":
			return <IconComponent icon='ph:file-csv-duotone' className={className} />;
		case "txt":
			return (
				<IconComponent icon='tabler:file-type-txt' className={className} />
			);
		default:
			return <IconComponent icon='ph:note-fill' className={className} />;
	}
};

export default getFileTypeIcon;
