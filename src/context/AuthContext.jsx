import React, { createContext, useContext, useState, useEffect } from 'react'
import { pocketBaseService } from '@/lib/pocketbase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始用户状态
    const getInitialUser = async () => {
      try {
        const currentUser = pocketBaseService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('获取用户状态失败:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // 监听认证状态变化
    const unsubscribe = pocketBaseService.onAuthChange((token) => {
      console.log('认证状态变化:', token)
      setUser(pocketBaseService.getCurrentUser())
      setLoading(false)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  // GitHub登录
  const loginWithGitHub = async () => {
    try {
      setLoading(true)
      const authData = await pocketBaseService.signInWithOAuth('github')
      return { success: true, error: null }
    } catch (error) {
      console.error('GitHub登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      setLoading(true)
      pocketBaseService.signOut()
      setUser(null)
      return { success: true, error: null }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // 获取用户头像URL
  const getUserAvatarUrl = () => {
    if (!user) return null
    return user.profile?.avatar || `https://github.com/${user.profile?.username}.png`
  }

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (!user) return null
    return user.profile?.name || user.profile?.username || user.email
  }

  const value = {
    user,
    loading,
    loginWithGitHub,
    logout,
    getUserAvatarUrl,
    getUserDisplayName,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
