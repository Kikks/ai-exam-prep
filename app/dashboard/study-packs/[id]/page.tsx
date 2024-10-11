"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@clerk/nextjs";

interface StudyPack {
  id: number;
  title: string;
  description: string;
  content: string;
  user_id: string;
}

export default function StudyPackDetails() {
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStudyPack() {
      const { data, error } = await supabase
        .from('study_packs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching study pack:', error);
      } else {
        setStudyPack(data);
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
      }
    }

    if (id) {
      fetchStudyPack();
    }
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('study_packs')
        .update({ title, description, content })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating study pack:', error);
        return;
      }

      setStudyPack(data[0]);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating study pack:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this study pack?')) {
      try {
        const { error } = await supabase
          .from('study_packs')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting study pack:', error);
          return;
        }

        router.push('/dashboard/study-packs');
      } catch (error) {
        console.error('Error deleting study pack:', error);
      }
    }
  };

  if (!studyPack) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={10}
          ></textarea>
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Save Changes
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">{studyPack.title}</h1>
          <p className="text-gray-600 mb-4">{studyPack.description}</p>
          <div className="prose max-w-none mb-6">{studyPack.content}</div>
          {user?.id === studyPack.user_id && (
            <div className="space-x-2">
              <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Edit
              </button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
