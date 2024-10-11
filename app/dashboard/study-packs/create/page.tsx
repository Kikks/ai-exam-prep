"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { StudyPack } from "@/types/index";
import { toast } from "sonner";
import { convertClerkIdToUUID } from "@/lib/supabase/helpers";

export default function CreateStudyPack() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [content, setContent] = useState("");
	const router = useRouter();
	const { user } = useUser();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const newStudyPack: Partial<StudyPack> = {
				title,
				description,
				areas_of_concentration: [],
				user_id: convertClerkIdToUUID(user?.id)
			};

			const { error } = await supabase
				.from("study_packs")
				.insert([newStudyPack])
				.select();

			if (error) {
				console.error("Error creating study pack:", error);
				toast.error(error?.message ?? "Error creating study pack");
				return;
			}

			router.push("/dashboard/study-packs");
		} catch (error) {
			console.error("Error creating study pack:", error);
		}
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-6'>Create New Study Pack</h1>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label
						htmlFor='title'
						className='block text-sm font-medium text-gray-700'
					>
						Title
					</label>
					<input
						type='text'
						id='title'
						value={title}
						onChange={e => setTitle(e.target.value)}
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
					/>
				</div>
				<div>
					<label
						htmlFor='description'
						className='block text-sm font-medium text-gray-700'
					>
						Description
					</label>
					<textarea
						id='description'
						value={description}
						onChange={e => setDescription(e.target.value)}
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
					></textarea>
				</div>
				<div>
					<label
						htmlFor='content'
						className='block text-sm font-medium text-gray-700'
					>
						Content
					</label>
					<textarea
						id='content'
						value={content}
						onChange={e => setContent(e.target.value)}
						required
						className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
						rows={10}
					></textarea>
				</div>
				<button
					type='submit'
					className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				>
					Create Study Pack
				</button>
			</form>
		</div>
	);
}
