import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TextLoader({
	blocks,
	lines,
	skeletonClassName
}: {
	blocks: number;
	lines: number;
	skeletonClassName?: string;
}) {
	return (
		<div className='w-full space-y-5'>
			{Array(blocks)
				.fill("")
				.map((_, id) => (
					<div key={id} className='w-full flex flex-col items-start space-y-2'>
						{Array(lines <= 0 ? 1 : lines - 1)
							.fill("")
							.map((__, idx) => (
								<Skeleton
									className={cn("h-6 w-full", skeletonClassName)}
									key={idx}
								/>
							))}

						<div className='w-[60%]'>
							<Skeleton className={cn("h-6 w-full", skeletonClassName)} />
						</div>
					</div>
				))}
		</div>
	);
}
