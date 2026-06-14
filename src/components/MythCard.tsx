import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Constellation } from '../types'
import { findIllustration } from '../data/illustrations'
import { useLikes } from '../hooks/useLikes'

interface Props {
  constellation: Constellation
  currentUserId?: string
  onClose: () => void
  onDelete: (id: string) => void
  showDelete?: boolean
}

export default function MythCard({ constellation, currentUserId, onClose, onDelete, showDelete = true }: Props) {
  const illus = findIllustration(constellation.name, constellation.myth ?? '')
  const [confirming, setConfirming] = useState(false)
  const { count: likeCount, likedByMe, toggle: toggleLike } = useLikes(constellation.id, currentUserId)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleDelete = () => {
    onDelete(constellation.id)
    onClose()
  }

  const handleProfile = () => {
    if (constellation.authorId) {
      onClose()
      navigate(`/user/${constellation.authorId}`)
    }
  }

  return (
    <div className="myth-overlay" onClick={onClose}>
      <div className="myth-card-inner" onClick={(e) => e.stopPropagation()}>

        <button className="myth-close" onClick={onClose} aria-label="閉じる">✕</button>

        {showDelete && !confirming && (
          <button className="myth-delete-top" onClick={() => setConfirming(true)}>🗑</button>
        )}
        {showDelete && confirming && (
          <div className="myth-confirm">
            <span>削除しますか？</span>
            <button className="myth-confirm-yes" onClick={handleDelete}>削除</button>
            <button className="myth-confirm-no" onClick={() => setConfirming(false)}>戻る</button>
          </div>
        )}

        {/* 星座イラストフレーム */}
        <div className="myth-illus-frame">
          <div className="myth-illus-inner" style={{ borderColor: constellation.color + '88' }}>
            <svg
              viewBox="0 0 200 200"
              width="100%"
              height="100%"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: illus.svg }}
              style={{ color: constellation.color }}
            />
          </div>
          <span className="myth-corner myth-corner--tl">✦</span>
          <span className="myth-corner myth-corner--tr">✦</span>
          <span className="myth-corner myth-corner--bl">✦</span>
          <span className="myth-corner myth-corner--br">✦</span>
        </div>

        <h3 className="myth-title" style={{ color: constellation.color }}>{constellation.name}</h3>

        <div className="myth-text-wrap">
          <p className="myth-text">
            {constellation.myth || '（この星座にまつわる物語はまだ記されていない）'}
          </p>
        </div>

        {constellation.author?.username && (
          <p className="myth-by">by {constellation.author.username}</p>
        )}

        <div className="myth-actions">
          <button className="myth-btn-profile" onClick={handleProfile}>
            プロフィールを見る
          </button>
          <button
            className={`myth-btn-like ${likedByMe ? 'liked' : ''}`}
            onClick={toggleLike}
          >
            {likedByMe ? '♥' : '♡'} いいね {likeCount > 0 && <span className="like-count">{likeCount}</span>}
          </button>
        </div>

      </div>
    </div>
  )
}
