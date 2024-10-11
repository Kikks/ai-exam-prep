import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import TextLoader from "@/components/text-loader";
import FormattedText from "@/components/formatted-text";
import { useAuth } from "@clerk/nextjs";
import { Document } from "@/types";
import getFileTypeIcon from "@/lib/icons";
import { Clock } from "lucide-react";

interface DocumentViewProps {
	document: Document | null;
	isFetching: boolean;
}

export default function DocumentView({
	document,
	isFetching
}: DocumentViewProps) {
	const { isLoaded } = useAuth();

	const backgroundImageStyle = document?.image
		? {
				backgroundImage: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.1)), url("${document?.image}")`,
				backgroundSize: "300px 300px",
				backgroundRepeat: "repeat",
				backgroundPosition: "center"
		  }
		: {};

	return (
		<div className='flex-1 overflow-y-auto'>
			<div className='w-full relative'>
				{isFetching || !isLoaded ? (
					<Skeleton className='w-full h-52 rounded-none' />
				) : (
					document?.image && (
						<figure className='w-full h-52' style={backgroundImageStyle} />
					)
				)}

				<div className='w-full max-w-[800px] absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'>
					<div className='size-28 grid place-items-center bg-background rounded-full'>
						{isFetching || !isLoaded ? (
							<Skeleton className='size-16 rounded-full' />
						) : (
							getFileTypeIcon(document?.file_type ?? "", {
								className: "size-14 text-foreground"
							})
						)}
					</div>
				</div>
			</div>

			<div className='pt-20 max-w-[800px] mx-auto flex flex-col items-start justify-between px-5 py-8 space-y-5 overflow-x-hidden'>
				{isFetching || !isLoaded ? (
					<TextLoader blocks={1} lines={2} />
				) : (
					<h1 className='text-3xl font-bold'>{document?.title}</h1>
				)}

				{isFetching || !isLoaded ? (
					<div className='w-40'>
						<TextLoader blocks={1} lines={1} />
					</div>
				) : (
					<div className='flex items-center divide-x'>
						<div className='flex space-x-2 items-center text-xs font-medium text-muted-foreground pr-3'>
							<Clock className='size-4' />
							<span>Created</span>
						</div>

						<p className='text-xs font-medium text-foreground pl-3'>
							{format(document?.created_at ?? new Date(), "MMM d, yyyy")}
						</p>
					</div>
				)}

				{isFetching || !isLoaded ? (
					<TextLoader blocks={5} lines={5} />
				) : (
					<FormattedText text={document?.content ?? ""} className='w-full' />
				)}
			</div>
		</div>
	);
}
