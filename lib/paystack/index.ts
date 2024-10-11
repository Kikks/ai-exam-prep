import axios, { AxiosResponse } from "axios";
import { VerifyPaymentResponse } from "./paystack.types";

const paystack = axios.create({
	baseURL: "https://api.paystack.co",
	headers: {
		Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
	}
});

export function verifyPayment(
	reference: string
): Promise<AxiosResponse<VerifyPaymentResponse>> {
	return paystack.get(`/transaction/verify/${reference}`);
}
