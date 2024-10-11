"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Coins, RefreshCcw } from "lucide-react";
import {
	CREDIT_RATE_PER_NAIRA,
	MIN_CREDITS_TO_BUY_IN_NAIRA
} from "@/lib/constants";
import { usePaystackPayment } from "react-paystack";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";

export default function CreditTopupDialog({
	open,
	onOpenChange
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [amount, setAmount] = useState<number>(0);
	const [conversionDirection, setConversionDirection] = useState<
		"nairaToCredits" | "creditsToNaira"
	>("nairaToCredits");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { user, isLoaded } = useUser();
	const [hideDialog, setHideDialog] = useState<boolean>(false);

	const getAmountInNaira = () => {
		return conversionDirection === "nairaToCredits"
			? amount
			: amount / CREDIT_RATE_PER_NAIRA;
	};

	const initializePayment = usePaystackPayment({
		publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
		email: user?.emailAddresses?.[0]?.emailAddress as string,
		amount: Math.round(getAmountInNaira() * 100),
		currency: "NGN",
		channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
	});

	const handleClose = () => {
		if (isLoading) return;

		setAmount(0);
		onOpenChange(false);
	};

	const onSuccess = async (response: any) => {
		try {
			toast.success("Verifying payment...");
			setHideDialog(false);

			const verifyResponse = await axios.post("/api/verify-payment", {
				reference: response.reference,
				userId: convertClerkIdToUUID(user?.id as string)
			});

			if (verifyResponse?.data) {
				toast.success("Payment verified and credits added!");
				handleClose();
			} else {
				toast.error("Payment verification failed. Reach out to support.");
			}
		} catch (error) {
			console.error("Error processing payment:", error);
			toast.error("An error occurred while processing your payment.");
			setHideDialog(false);
		} finally {
			setIsLoading(false);
		}
	};

	const onClose = () => {
		toast.error("Payment cancelled.");
		setIsLoading(false);
		setHideDialog(false);
	};

	const handleSubmit = () => {
		if (!isLoaded) return;

		const amountInNaira = getAmountInNaira();

		if (amountInNaira < MIN_CREDITS_TO_BUY_IN_NAIRA) {
			toast.error(
				`You can't buy less than ₦${MIN_CREDITS_TO_BUY_IN_NAIRA} worth of credits`
			);
			return;
		}

		setIsLoading(true);
		setHideDialog(true);

		initializePayment({
			onSuccess,
			onClose
		});
	};

	const toggleConversionDirection = () => {
		setConversionDirection(prev =>
			prev === "nairaToCredits" ? "creditsToNaira" : "nairaToCredits"
		);
	};

	const getConvertedAmount = () => {
		return conversionDirection === "nairaToCredits"
			? amount * CREDIT_RATE_PER_NAIRA
			: amount / CREDIT_RATE_PER_NAIRA;
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat("en-US").format(Math.round(num));
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9]/g, "");
		setAmount(Number(value));
	};

	useEffect(() => {
		if (conversionDirection === "nairaToCredits") {
			setAmount(amount ?? 0 * CREDIT_RATE_PER_NAIRA);
		} else {
			setAmount(amount ?? 0 / CREDIT_RATE_PER_NAIRA);
		}
	}, [conversionDirection, amount]);

	return hideDialog ? (
		<></>
	) : (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='w-[90%] sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='!text-left'>Add Credits</DialogTitle>
					<DialogDescription className='!text-left'>
						How many credits do you want to add?
					</DialogDescription>
				</DialogHeader>

				<div className='flex flex-col space-y-2'>
					<div className='w-full flex flex-col space-y-2'>
						<Label>Amount</Label>

						<div className='w-full flex items-center space-x-2'>
							<div className='flex-1 relative'>
								<div className='absolute left-2 top-1/2 -translate-y-1/2'>
									{conversionDirection === "nairaToCredits" ? (
										<span className='text-muted-foreground text-sm'>₦</span>
									) : (
										<Coins className='h-4 w-4 text-muted-foreground' />
									)}
								</div>

								<Input
									type='text'
									inputMode='numeric'
									className='pl-7'
									value={formatNumber(amount)}
									onChange={handleAmountChange}
									disabled={isLoading}
								/>
							</div>

							<Button
								variant='outline'
								size='icon'
								onClick={toggleConversionDirection}
							>
								<RefreshCcw className='h-4 w-4' />
							</Button>
						</div>
					</div>

					<div className='w-full flex flex-col space-y-5'>
						<div className='w-full items-center flex space-x-2'>
							<span className='text-muted-foreground text-sm'>
								{conversionDirection === "nairaToCredits" ? "Credits" : "₦"}
							</span>

							<span className='text-muted-foreground text-sm'>
								{Intl.NumberFormat("en-US").format(getConvertedAmount())}
							</span>
						</div>

						<div className='w-full border-l-2 pl-3 py-3'>
							<p className='text-muted-foreground text-[10px]'>
								Rate -{" "}
								<span className='font-bold'>
									₦1 = {CREDIT_RATE_PER_NAIRA} Credits
								</span>
							</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading}>
						{isLoading ? "Processing..." : "Add Credits"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
