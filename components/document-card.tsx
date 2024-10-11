import { Document } from "@/types";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";

const childVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
	exit: { opacity: 0, y: 20 }
};

interface DocumentCardProps {
	document: Partial<Document>;
	showCheckbox?: boolean;
	isChecked?: boolean;
	onCheckClick?: (id: string) => void;
}

export default function DocumentCard({
	document,
	showCheckbox = true,
	isChecked,
	onCheckClick
}: DocumentCardProps) {
	return (
		<div key={document.id} className='relative group'>
			{showCheckbox && (
				<Checkbox
					id={document.id}
					checked={isChecked}
					onClick={() => onCheckClick?.(document?.id ?? "")}
					className={cn(
						"absolute !size-6 -top-2 -left-2 opacity-0 group-hover:opacity-100 z-20 shadow-md bg-background",
						isChecked ? "opacity-100" : "opacity-0"
					)}
				/>
			)}

			<Link href={`/dashboard/library/${document.id}`} className='z-10'>
				<motion.div
					key={document.id}
					variants={childVariants}
					whileHover={{ scale: 1.05 }}
					className='cursor-pointer'
				>
					<div className='space-y-3'>
						<figure className='aspect-video rounded-md overflow-hidden relative border-muted/90 border'>
							<Image
								src={document?.image ?? ""}
								alt={document.title ?? ""}
								className='w-full h-full object-cover'
								layout='fill'
							/>
						</figure>

						<div className='space-y-1'>
							<h4 className='font-bold text-sm leading-none line-clamp-1'>
								{document.title ?? "Untitled Document"}
							</h4>
							<p className='text-xs font-medium text-muted-foreground'>
								{format(document?.created_at ?? new Date(), "MMM d, yyyy")}
							</p>
						</div>
					</div>
				</motion.div>
			</Link>
		</div>
	);
}
