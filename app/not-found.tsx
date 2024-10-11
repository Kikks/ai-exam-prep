"use client";
import { Button } from "@/components/ui/button";
import { TextAnimate } from "@/components/ui/text-animate";
import React from "react";

export default function NotFound() {
	return (
		<main className='w-full h-screen flex flex-col items-center justify-center'>
			<TextAnimate text='Habaaaaaaaa...' type='popIn' />
			<p className='text-lg text-gray-600 max-w-[35ch] text-center mb-10'>
				You&apos;re not supposed to be here 🌚. It&apos;s no problem though,
				let&apos; get you home!
			</p>

			<Button onClick={() => window.location.replace("/")}>Go Home</Button>
		</main>
	);
}
