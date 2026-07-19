import {
  createContext,
  type PropsWithChildren,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from 'react'
import { logout } from '@/features/auth/api'
import { setAuthToken } from '@/lib/http'
import type { AuthSession } from '@/types/api'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  setSession: (session: AuthSession | null) => void
  signOut: () => void
}

const storageKey = 'enterprise-hris.session'

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(storageKey)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(storageKey)

    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession | null>(readStoredSession)

  const persistSession = useEffectEvent((nextSession: AuthSession | null) => {
    setAuthToken(nextSession?.access_token ?? null)

    if (!nextSession) {
      window.localStorage.removeItem(storageKey)
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(nextSession))
  })

  useEffect(() => {
    persistSession(session)
  }, [persistSession, session])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) {
        return
      }

      startTransition(() => {
        setSessionState(readStoredSession())
      })
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      setSession: setSessionState,
      signOut: () => {
        void logout().catch(() => null)
        setSessionState(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
