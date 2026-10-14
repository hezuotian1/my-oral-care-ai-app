import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'

function readStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as UserInfo) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<UserInfo | null>(readStoredUser())

  const isLoggedIn = computed(() => Boolean(token.value))

  function setLogin(payload: { token: string; user: UserInfo }) {
    token.value = payload.token
    user.value = payload.user
    localStorage.setItem('token', payload.token)
    localStorage.setItem('user', JSON.stringify(payload.user))
  }

  function setUser(next: UserInfo) {
    user.value = next
    localStorage.setItem('user', JSON.stringify(next))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isLoggedIn, setLogin, setUser, logout }
})
