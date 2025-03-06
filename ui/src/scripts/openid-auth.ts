import { openIdAuth } from '@/api/auth'

import { authStore } from '@/store/auth-store'

const executeOpenIdAuth = async (): Promise<void> => {
  const jwt = location.href.match(/[?&]jwt=([^&]+)/)?.[1]
  const redirect = location.href.match(/[?&]redirect=([^&]+)/)?.[1]

  if (!jwt) {
    const url = await openIdAuth()

    window.location.assign(url)
  }

  if (jwt && redirect) {
    authStore.login(jwt)
    window.location.assign(redirect)
  }
}

executeOpenIdAuth()
