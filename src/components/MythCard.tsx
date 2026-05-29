import { useEffect, useState } from 'react'
import { Constellation } from '../types'
import { findIllustration } from '../data/illustrations'

interface Props {
  constellation: Constellation
  onClose: () => void
  onDelete: (id: string) => void
}

export default function MythCard({ constellation, onClose, onDelete }: Props) {
  const illus = findIllustration(constellation.name, constellation.myth ?? '')
  const [confirming, setConfirming] = useState(false)

  // Escape キーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDelete = () => {
    onDelete(constellation.id)
    onClose()
  }

  return (
    <div className="myth-overlay" onClick={onClose}>
      <div className="myth-card-inner" onClick={(e) => e.stopPropagation()}>
        <button className="myth-close" onClick={onClose} aria-label="閉じる">✕</button>

        {/* イラスト */}
        <div className="myth-illustration" style={{ color: constellation.color }}>
          <svg
            viewBox="0 0 200 200"
            width="120"
            height="120"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: illus.svg }}
          />
        </div>

        <span className="myth-color-star" style={{ color: constellation.color }}>✦</span>
        <h3 className="myth-title">{constellation.name}</h3>

        <div className="myth-divider" style={{ borderColor: constellation.color + '55' }} />

        <p className="myth-text">
          {constellation.myth || '（この星座にまつわる物語はまだ記されていない）'}
        </p>

        <div className="myth-footer">
          <span className="myth-stars-count">
            {constellation.starIds?.length ?? 0} つの星で結ばれた星座
          </span>

          {/* 削除ボタン */}
          {!confirming ? (
            <button className="myth-delete" onClick={() => setConfirming(true)}>
              🗑 削除
            </button>
          ) : (
            <div className="myth-confirm">
              <span>本当に削除しますか？</span>
              <button className="myth-confirm-yes" onClick={handleDelete}>削除する</button>
              <button className="myth-confirm-no" onClick={() => setConfirming(false)}>キャンセル</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
