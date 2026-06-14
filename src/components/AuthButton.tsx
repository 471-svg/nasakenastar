import { Profile } from '../types'

interface Props {
  profile: Profile | null
  loading: boolean
  onLogin: () => void
  onLogout: () => void
}

export default function AuthButton({ profile, loading, onLogin }: Props) {

  if (loading || profile) return null

  return (
    <button className="auth-login-btn" onClick={onLogin}>
      Googleでログイン
    </button>
  )
}
