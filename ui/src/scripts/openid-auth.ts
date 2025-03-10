import { authStore } from '@/store/auth-store'

const executeOpenIdAuth = async (): Promise<void> => {
  const params = new URLSearchParams(location.search)
  const jwt = params.get('jwt')
  const redirect = params.get('redirect')

  if (!jwt || !redirect) {
    console.error('No jwt or redirect received from backend to store on the client.')

    return
  }

  authStore.login(jwt)
  window.location.assign(redirect)
}

executeOpenIdAuth()
