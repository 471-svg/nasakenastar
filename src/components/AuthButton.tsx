import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Profile } from '../types'

interface Props {
  profile: Profile | null
  loading: boolean
  onLogin: () => void
  onLogout: () => void
}

export default function AuthButton({ profile, loading, onLogin, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) return null

  if (!profile) {
    return (
      <button className="auth-login-btn" onClick={onLogin}>
        Googleでログイン
      </button>
    )
  }

  return (
    <div className="auth-user">
      <button className="auth-avatar-btn" onClick={() => setMenuOpen((v) => !v)}>
        {profile.avatarUrl
          ? <img src={profile.avatarUrl} alt={profile.username} className="auth-avatar-img" />
          : <span className="auth-avatar-placeholder">{profile.username[0]}</span>
        }
      </button>

      {menuOpen && (
        <>
          <div className="auth-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="auth-menu">
            <div className="auth-menu-name">{profile.username}</div>
            <Link
              to={`/user/${profile.id}`}
              className="auth-menu-item"
              onClick={() => setMenuOpen(false)}
            >
              ✦ マイプロフィール
            </Link>
            <button className="auth-menu-item auth-menu-logout" onClick={onLogout}>
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  )
}
