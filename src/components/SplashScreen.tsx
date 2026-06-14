import { useEffect, useState, useMemo } from 'react'

interface Props {
  onFinished: () => void
}

function randomStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const tier = Math.random()
    const cls = tier < 0.78 ? 'star-mid' : tier < 0.96 ? 'star-bright' : 'star-giant'
    const r = cls === 'star-giant' ? 0.15 : cls === 'star-bright' ? 0.11 : 0.06
    const glow = cls !== 'star-mid'
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r,
      cls,
      glow,
      tw: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 6}s`,
      color: tier > 0.92 ? '#a8eeff' : tier > 0.80 ? '#cce4ff' : '#ffffff',
      opacity: cls === 'star-mid' ? 0.6 + Math.random() * 0.4 : 1,
    }
  })
}

function nebulaStars(count: number, cx: number, cy: number, rx: number, ry: number, startId: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.pow(Math.random(), 0.6)
    const x = cx + Math.cos(angle) * rx * dist
    const y = cy + Math.sin(angle) * ry * dist
    return {
      id: startId + i,
      x, y,
      r: 0.04 + Math.random() * 0.05,
      cls: 'star-mid' as const,
      glow: false,
      tw: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 6}s`,
      color: Math.random() > 0.5 ? '#b8e8ff' : '#ffffff',
      opacity: 0.5 + Math.random() * 0.5,
    }
  })
}

export default function SplashScreen({ onFinished }: Props) {
  const [phase, setPhase] = useState<'show' | 'fadeout'>('show')
  const stars = useMemo(() => [
    ...randomStars(900),
    ...nebulaStars(400, 48, 30, 28, 18, 10000),
    ...nebulaStars(300, 30, 58, 20, 14, 20000),
    ...nebulaStars(250, 68, 72, 18, 12, 30000),
  ], [])

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('fadeout'), 2500)
    const timer2 = setTimeout(() => onFinished(), 3400)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [onFinished])

  return (
    <div className={`splash ${phase === 'fadeout' ? 'splash--out' : ''}`}>
      <svg className="splash-stars" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow-sm" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-md" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 暗い小星（グローなし） */}
        {stars.filter(s => !s.glow).map(s => (
          <circle
            key={s.id}
            cx={s.x} cy={s.y} r={s.r}
            fill={s.color}
            className={s.cls}
            opacity={s.opacity}
            style={{ '--tw': s.tw, animationDelay: s.delay } as React.CSSProperties}
          />
        ))}

        {/* 明るい星（グロー付き） */}
        {stars.filter(s => s.glow).map(s => (
          <circle
            key={s.id}
            cx={s.x} cy={s.y} r={s.r}
            fill={s.color}
            className={s.cls}
            opacity={s.opacity}
            filter={s.cls === 'star-giant' ? 'url(#glow-md)' : 'url(#glow-sm)'}
            style={{ '--tw': s.tw, animationDelay: s.delay } as React.CSSProperties}
          />
        ))}
      </svg>

      <div className="splash-inner">
        <img src="/nasakenightlogo.png" alt="情けNIGHT" className="splash-app-logo" />
      </div>

      <div className="splash-company">
        <img src="/kigyoulogo.png" alt="company logo" className="splash-company-img" />
      </div>
    </div>
  )
}
