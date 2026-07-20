import axios from 'axios'
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import { logout, refreshSession } from '@/features/auth/api'
import { http, setAuthToken } from '@/lib/http'
import type { AuthSession } from '@/types/api'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  setSession: Dispatch<SetStateAction<AuthSession | null>>
  signOut: () => void
}

const storageKey = 'enterprise-hris.session'
let refreshRequest: Promise<AuthSession> | null = null

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(storageKey) ?? window.sessionStorage.getItem(storageKey)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(storageKey)
    window.sessionStorage.removeItem(storageKey)

    return null
  }
}

function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(storageKey)
  window.sessionStorage.removeItem(storageKey)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession | null>(readStoredSession)
  const sessionRef = useRef<AuthSession | null>(session)

  const persistSession = useEffectEvent((nextSession: AuthSession | null) => {
    sessionRef.current = nextSession
    setAuthToken(nextSession?.access_token ?? null)

    if (!nextSession) {
      clearStoredSession()
      return
    }

    const serialized = JSON.stringify(nextSession)

    if (nextSession.remember) {
      window.localStorage.setItem(storageKey, serialized)
      window.sessionStorage.removeItem(storageKey)
      return
    }

    window.sessionStorage.setItem(storageKey, serialized)
    window.localStorage.removeItem(storageKey)
  })

  useEffect(() => {
    persistSession(session)
  }, [persistSession, session])

  useEffect(() => {
    const interceptorId = http.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!axios.isAxiosError(error)) {
          throw error
        }

        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
        const requestUrl = originalRequest?.url ?? ''

        if (
          !originalRequest
          || originalRequest._retry
          || error.response?.status !== 401
          || requestUrl.includes('/auth/login')
          || requestUrl.includes('/auth/refresh')
        ) {
          throw error
        }

        const currentSession = sessionRef.current

        if (!currentSession?.refresh_token) {
          startTransition(() => {
            setSessionState(null)
          })

          throw error
        }

        originalRequest._retry = true

        if (!refreshRequest) {
          refreshRequest = refreshSession(currentSession.refresh_token)
            .then((nextSession) => {
              startTransition(() => {
                setSessionState(nextSession)
              })

              return nextSession
            })
            .catch((refreshError) => {
              startTransition(() => {
                setSessionState(null)
              })

              throw refreshError
            })
            .finally(() => {
              refreshRequest = null
            })
        }

        const nextSession = await refreshRequest
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${nextSession.access_token}`

        return http(originalRequest)
      },
    )

    return () => {
      http.interceptors.response.eject(interceptorId)
    }
  }, [])

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
