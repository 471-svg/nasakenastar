export interface StarData {
  id: string
  x: number
  y: number
  size: number
  twinkle: number
  color?: string
}

export interface ConstellationLine {
  from: string
  to: string
}

export interface Constellation {
  id: string
  name: string
  myth: string
  lines: ConstellationLine[]
  starIds: string[]
  color: string
  authorId: string
  createdAt: number
  // プロフィール結合（オプション）
  author?: Profile
}

export interface Profile {
  id: string
  username: string
  bio: string
  avatarUrl: string
}
