import { useState, useEffect } from 'react'

const STEPS = [
  {
    icon: '✦',
    title: 'ようこそ、情けNIGHTへ',
    desc: '星空の掲示板へようこそ。\n誰かの日常が、星座になって輝いています。',
  },
  {
    icon: '👆',
    title: '星座をタップ',
    desc: '星と星を結んだ線をタップすると、\nその星座にまつわる物語が読めます。',
  },
  {
    icon: '🪐',
    title: '惑星でしぼりこむ',
    desc: '下の惑星をタップすると\nテーマ別に星座を絞り込めます。\n左右にスワイプして惑星を切り替えられます。',
  },
  {
    icon: '🌟',
    title: '星座を作る',
    desc: 'Googleでログインすると\n自分だけの星座を星空に刻めます。\n「✦ 星座を作る」ボタンから始めよう。',
  },
]

export default function TutorialModal() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem('nasaken-tutorial-done')) {
      setVisible(true)
    }
  }, [])

  const close = () => {
    localStorage.setItem('nasaken-tutorial-done', '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="tutorial-overlay" onClick={close}>
      <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
        <button className="tutorial-skip" onClick={close}>スキップ</button>

        <div className="tutorial-icon">{current.icon}</div>
        <h2 className="tutorial-title">{current.title}</h2>
        <p className="tutorial-desc">{current.desc}</p>

        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`tutorial-dot ${i === step ? 'tutorial-dot--active' : ''}`} />
          ))}
        </div>

        <button
          className="tutorial-next"
          onClick={() => isLast ? close() : setStep((s) => s + 1)}
        >
          {isLast ? 'はじめる ✦' : '次へ →'}
        </button>
      </div>
    </div>
  )
}
