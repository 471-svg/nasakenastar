import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import { Constellation, ConstellationLine } from '../types'

export function useConstellations() {
  const [constellations, setConstellations] = useState<Constellation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'constellations'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Constellation[]
      setConstellations(data)
      setLoading(false)
    })
    return unsub
  }, [])

  async function addConstellation(params: {
    name: string
    myth: string
    lines: ConstellationLine[]
    starIds: string[]
    color: string
    authorId: string
  }) {
    await addDoc(collection(db, 'constellations'), {
      ...params,
      createdAt: serverTimestamp(),
    })
  }

  return { constellations, loading, addConstellation }
}
