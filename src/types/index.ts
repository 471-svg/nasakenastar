export interface StarData {
  id: string
  x: number
  y: number
  size: number      // 半径 (px)
  twinkle: number   // アニメーション遅延
  color?: string    // CSS 色 (B-V 由来)
}

export interface ConstellationLine {
  from: string   // star id
  to: string     // star id
}

export interface Constellation {
  id: string
  name: string
  myth: string              // 神話的な説明
  lines: ConstellationLine[]
  starIds: string[]
  color: string
  authorId: string
  createdAt: number
}
