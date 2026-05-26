import { StarData } from '../types'

// シード付き疑似乱数 (再現性のある星空)
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function generateStars(count: number = 400): StarData[] {
  const rand = seededRandom(20240601)
  const stars: StarData[] = []

  const CANVAS_W = 6000
  const CANVAS_H = 4000

  for (let i = 0; i < count; i++) {
    const r = rand()
    stars.push({
      id: `star-${i}`,
      x: rand() * CANVAS_W,
      y: rand() * CANVAS_H,
      size: r < 0.6 ? 1 : r < 0.88 ? 1.5 : r < 0.97 ? 2.2 : 3,
      twinkle: rand() * 4,
    })
  }

  return stars
}

export const CANVAS_WIDTH = 6000
export const CANVAS_HEIGHT = 4000
