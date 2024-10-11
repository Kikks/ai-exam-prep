import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";
import { Bell, Coins, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";

import { Skeleton } from "@/components/ui/skeleton";
import { creditsBalanceAtom } from "@/atoms/wallet";
import { useAtom, useSetAtom } from "jotai";
import { topupDialogOpenAtom } from "@/atoms/layout";

export default function Navbar() {
	const [credits, setCredits] = useAtom(creditsBalanceAtom);
	const { isLoaded, userId } = useAuth();
	const [isFetchingCredits, setIsFetchingCredits] = useState(false);
	const setShowCreditTopupDialog = useSetAtom(topupDialogOpenAtom);

	useEffect(() => {
		if (isLoaded && userId) {
			fetchCredits();

			const subscription = supabase
				.channel("credits")
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "user_credits",
						filter: `user_id=eq.${convertClerkIdToUUID(userId)}`
					},
					payload => {
						setCredits(prev => payload.new?.balance ?? prev);
					}
				)
				.subscribe();

			return () => {
				subscription.unsubscribe();
			};
		}
	}, [isLoaded, userId, supabase]);

	const fetchCredits = async () => {
		setIsFetchingCredits(true);
		const { data, error } = await supabase
			.from("user_credits")
			.select("*")
			.eq("user_id", convertClerkIdToUUID(userId))
			.single();

		if (data) {
			setCredits(data?.balance ?? 0);
		} else if (error) {
			console.error("Error fetching credits:", error);
		}

		setIsFetchingCredits(false);
	};

	return (
		<div className='h-14 w-full flex items-center justify-between px-4 border-b'>
			<div />

			<div className='flex items-center space-x-2'>
				<Tooltip delayDuration={0}>
					<TooltipTrigger>
						<button className='flex items-center space-x-2'>
							<span className='text-sm font-bold'>Credits:</span>

							{isFetchingCredits || !isLoaded ? (
								<Skeleton className='h-6 w-20 rounded-full' />
							) : (
								<div className='flex space-x-2 items-center rounded-full px-2 py-1 bg-primary'>
									<Coins className='h-4 w-4 text-primary-foreground' />
									<span className='text-xs font-bold text-primary-foreground'>
										{formatNumber(credits)}
									</span>
								</div>
							)}
						</button>
					</TooltipTrigger>
					<TooltipContent
						align='end'
						className='w-[350px] bg-background flex items-center border shadow-md space-x-4 p-4'
					>
						<div className='border-4 border-primary rounded-full aspect-square h-14 w-14 grid place-items-center text-foreground'>
							<span className='text-xs font-bold'>{formatNumber(credits)}</span>
						</div>

						<div className='fex-1 flex flex-col'>
							<span className='text-xs font-bold uppercase text-foreground'>
								Remaining Credits
							</span>
							<span className='text-xs text-[10px] font-medium text-muted-foreground'>
								Used to generate study materials
							</span>
						</div>

						<Button
							size='sm'
							variant='outline'
							className='text-foreground'
							onClick={() => setShowCreditTopupDialog(true)}
						>
							Add Credits
						</Button>
					</TooltipContent>
				</Tooltip>

				<div className='w-0.5 h-6 bg-border' />

				<Tooltip>
					<TooltipTrigger>
						<Button size='icon' variant='ghost'>
							<HelpCircle className='h-4 w-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span>FAQs</span>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger>
						<Button size='icon' variant='ghost'>
							<Bell className='h-4 w-4' />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<span>Notifications</span>
					</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
}
