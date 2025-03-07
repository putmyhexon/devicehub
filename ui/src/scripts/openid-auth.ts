import { openIdAuth, openIdCallback } from '@/api/auth'

import { authStore } from '@/store/auth-store'

const executeOpenIdAuth = async (): Promise<void> => {
  const code = location.href.match(/[?&]code=([^&]+)/)?.[1]

  if (!code) {
    const url = await openIdAuth()

    window.location.assign(url)
  }

  if (code) {
    const { jwt, redirect } = await openIdCallback(code)

    authStore.login(jwt)
    window.location.assign(redirect)
  }
}

executeOpenIdAuth()
