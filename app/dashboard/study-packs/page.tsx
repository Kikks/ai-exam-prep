"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";

interface StudyPack {
	id: number;
	title: string;
	description: string;
	user_id: string;
}

export default function StudyPacks() {
	const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);
	const { userId, isLoaded } = useAuth();

	useEffect(() => {
		async function fetchStudyPacks() {
			const { data, error } = await supabase
				.from("study_packs")
				.select("*")
				.eq("user_id", convertClerkIdToUUID(userId));

			if (error) {
				console.error("Error fetching study packs:", error);
			} else {
				setStudyPacks(data || []);
			}
		}

		if (isLoaded) {
			fetchStudyPacks();
		}
	}, [isLoaded, userId]);

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>My Study Packs</h1>
			<Link
				href='/dashboard/study-packs/create'
				className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block'
			>
				Create New Study Pack
			</Link>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{studyPacks.map(pack => (
					<div key={pack.id} className='border p-4 rounded shadow'>
						<h2 className='text-xl font-semibold mb-2'>{pack.title}</h2>
						<p className='text-gray-600 mb-4'>{pack.description}</p>
						<Link
							href={`/dashboard/study-packs/${pack.id}`}
							className='text-blue-500 hover:text-blue-700'
						>
							View Details
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
