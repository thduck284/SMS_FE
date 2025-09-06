import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

const STORAGE_KEY_TOKEN = 'token'
const STORAGE_KEY_PROFILE = 'profile'

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || '')
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE)
    try { return raw ? JSON.parse(raw) : null } catch { return null }
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  const saveSession = useCallback((token) => {
    setAccessToken(token || '')
    if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token)
    else localStorage.removeItem(STORAGE_KEY_TOKEN)
  }, [])

  const clearSession = useCallback(() => {
    setAccessToken('')
    setProfile(null)
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_PROFILE)
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!accessToken) return null
    setIsLoadingProfile(true)
    try {
      const res = await fetch('http://localhost:3000/user/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(data))
      return data
    } catch (e) {
      clearSession()
      return null
    } finally {
      setIsLoadingProfile(false)
    }
  }, [accessToken, clearSession])

  useEffect(() => {
    if (accessToken && !profile && !isLoadingProfile) {
      fetchProfile()
    }
  }, [accessToken, profile, isLoadingProfile, fetchProfile])

  const value = useMemo(() => ({
    accessToken,
    profile,
    isAuthenticated: Boolean(accessToken),
    isLoadingProfile,
    setProfile,
    saveSession,
    clearSession,
    fetchProfile,
  }), [accessToken, profile, isLoadingProfile, saveSession, clearSession, fetchProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}



