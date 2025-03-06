import { makeAutoObservable } from 'mobx'

class AuthStore {
  // TODO: use proper hydration from mobx-persis-store

  constructor() {
    makeAutoObservable(this)
  }

  get jwt(): string | null {
    return localStorage.getItem('jwt')
  }
  set jwt(value: string | null) {
    if (value === null) {
      localStorage.removeItem('jwt')

      return
    }

    localStorage.setItem('jwt', value)
  }

  login(jwt: string): void {
    this.jwt = jwt
  }

  logout(): void {
    this.jwt = null
  }

  get isAuthed(): boolean {
    return this.jwt !== null
  }
}

export const authStore = new AuthStore()
