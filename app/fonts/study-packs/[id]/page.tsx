'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface StudyPack {
  id: number
  title: string
  description: string
  content: string
}

export default function StudyPackPage() {
  const { id } = useParams()
  const [studyPack, setStudyPack] = useState<StudyPack | null>(null)

  useEffect(() => {
    async function fetchStudyPack() {
      const { data, error } = await supabase
        .from('study_packs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching study pack:', error)
      } else {
        setStudyPack(data)
      }
    }

    if (id) {
      fetchStudyPack()
    }
  }, [id])

  if (!studyPack) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{studyPack.title}</h1>
      <p className="text-gray-600 mb-6">{studyPack.description}</p>
      <div className="prose max-w-none">
        {studyPack.content}
      </div>
    </div>
  )
}
