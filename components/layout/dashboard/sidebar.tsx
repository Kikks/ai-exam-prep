"use client";

import React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { GraduationCap, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { sidebarLinks } from "./data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	TooltipTrigger,
	TooltipContent,
	Tooltip
} from "@/components/ui/tooltip";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sidebar() {
	const { user, isLoaded } = useUser();
	const { signOut } = useAuth();
	const router = useRouter();
	const { themes, theme, setTheme } = useTheme();

	return (
		<aside className='fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex'>
			<nav className='flex flex-col items-center gap-4 px-2 sm:py-4'>
				<Link
					href='#'
					className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
				>
					<GraduationCap className='h-4 w-4 transition-all group-hover:scale-110' />
					<span className='sr-only'>Study Genius</span>
				</Link>

				{sidebarLinks.map(link => (
					<Tooltip key={link.name} delayDuration={500}>
						<TooltipTrigger asChild>
							<Link
								href={link.href}
								className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted md:h-8 md:w-8'
							>
								<link.icon className='h-5 w-5' />
								<span className='sr-only'>{link.name}</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side='right'>{link.name}</TooltipContent>
					</Tooltip>
				))}
			</nav>

			<nav className='mt-auto flex flex-col items-center gap-4 px-2 sm:py-4'>
				<Tooltip delayDuration={500}>
					<TooltipTrigger asChild>
						<Link
							href='#'
							className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted md:h-8 md:w-8'
						>
							<Settings className='h-5 w-5' />
							<span className='sr-only'>Settings</span>
						</Link>
					</TooltipTrigger>
					<TooltipContent side='right'>Settings</TooltipContent>
				</Tooltip>

				<DropdownMenu>
					<DropdownMenuTrigger asChild disabled={!isLoaded}>
						{isLoaded ? (
							<Avatar className='h-9 w-9 md:h-8 md:w-8 cursor-pointer'>
								<AvatarImage src={user?.imageUrl} />
								<AvatarFallback>
									{user?.fullName?.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						) : (
							<Skeleton className='h-9 w-9 md:h-8 md:w-8 rounded-full' />
						)}
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-64 p-2' align='end' side='right'>
						<DropdownMenuLabel>
							<h4 className='font-bold text-sm leading-none'>
								{user?.fullName}
							</h4>
							<p className='text-xs font-medium text-muted-foreground'>
								{user?.emailAddresses[0].emailAddress}
							</p>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => router.push("/profile")}>
							Profile
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => router.push("/billing")}>
							Billing
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem disabled>Theme</DropdownMenuItem>
						{themes.map(t => (
							<DropdownMenuCheckboxItem
								checked={t === theme}
								onCheckedChange={() => setTheme(t)}
								key={t}
								className='capitalize'
							>
								{t}
							</DropdownMenuCheckboxItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => signOut({ redirectUrl: "/auth/login" })}
							className='text-destructive hover:!text-destructive hover:!bg-destructive/20'
						>
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</nav>
		</aside>
	);
}
