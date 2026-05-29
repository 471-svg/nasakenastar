import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import { Profile } from '../types'

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初回セッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // ログイン状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(toProfile(data))
    } else {
      // 初回ログイン時に自動でプロフィール作成
      await createProfile(userId)
    }
    setLoading(false)
  }

  async function createProfile(userId: string) {
    const meta = (await supabase.auth.getUser()).data.user?.user_metadata ?? {}
    const { data } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: meta.full_name ?? meta.name ?? 'ユーザー',
        bio: '',
        avatar_url: meta.avatar_url ?? meta.picture ?? '',
      })
      .select()
      .single()
    if (data) setProfile(toProfile(data))
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates: Partial<Omit<Profile, 'id'>>) {
    if (!user) return
    const dbUpdates: Record<string, string> = {}
    if (updates.username !== undefined)  dbUpdates.username   = updates.username
    if (updates.bio !== undefined)       dbUpdates.bio        = updates.bio
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl

    const { data } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(toProfile(data))
  }

  return { user, profile, loading, signInWithGoogle, signOut, updateProfile }
}

// DB のスネークケース → キャメルケース
function toProfile(row: Record<string, unknown>): Profile {
  return {
    id:        row.id        as string,
    username:  row.username  as string,
    bio:       (row.bio      as string) ?? '',
    avatarUrl: (row.avatar_url as string) ?? '',
  }
}

// 他のユーザーのプロフィールを1件取得
export async function fetchPublicProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data ? toProfile(data) : null
}
