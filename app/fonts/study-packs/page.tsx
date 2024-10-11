"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface StudyPack {
	id: number;
	title: string;
	description: string;
}

export default function StudyPacks() {
	const [studyPacks, setStudyPacks] = useState<StudyPack[]>([]);

	useEffect(() => {
		async function fetchStudyPacks() {
			const { data, error } = await supabase.from("study_packs").select("*");

			if (error) {
				console.error("Error fetching study packs:", error);
			} else {
				setStudyPacks(data || []);
			}
		}

		fetchStudyPacks();
	}, []);

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Study Packs</h1>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{studyPacks.map(pack => (
					<Link href={`/study-packs/${pack.id}`} key={pack.id}>
						<div className='border rounded-lg p-4 hover:shadow-lg transition-shadow'>
							<h2 className='text-xl font-semibold mb-2'>{pack.title}</h2>
							<p className='text-gray-600'>{pack.description}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
