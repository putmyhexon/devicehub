import { makeAutoObservable } from 'mobx'
import { inject, injectable } from 'inversify'
import { QueryObserverResult } from '@tanstack/react-query'

import { socket } from '@/api/socket'
import { AccessTokenGeneratedMessage } from '@/types/access-token-generated-message.type'

import { queries } from '@/config/queries/query-key-store'
import { queryClient } from '@/config/queries/query-client'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import type { MobxQueryFactory } from '@/types/mobx-query-factory.type'

@injectable()
export class AccessTokenService {
  private accessTokensQuery
  private tokenToRemove = ''

  generatedTokenId = ''

  constructor(@inject(CONTAINER_IDS.factoryMobxQuery) mobxQueryFactory: MobxQueryFactory) {
    makeAutoObservable(this)

    this.onAccessTokenGenerated = this.onAccessTokenGenerated.bind(this)

    this.accessTokensQuery = mobxQueryFactory(() => ({ ...queries.user.accessTokens }))
  }

  get accessTokensQueryResult(): QueryObserverResult<string[]> {
    return this.accessTokensQuery.result
  }

  setTokenToRemove(token: string): void {
    this.tokenToRemove = token
  }

  resetGeneratedTokenId(accessTokenLabel: string): void {
    queryClient.setQueryData<string[]>(queries.user.accessTokens.queryKey, (oldData) => {
      if (!oldData) return []

      return [accessTokenLabel, ...oldData]
    })

    this.generatedTokenId = ''
  }

  addAccessTokenGeneratedListener(): void {
    socket.on('user.keys.accessToken.generated', this.onAccessTokenGenerated)
  }

  removeAccessTokenGeneratedListener(): void {
    socket.off('user.keys.accessToken.generated', this.onAccessTokenGenerated)
  }

  generateAccessToken(title: string): void {
    socket.emit('user.keys.accessToken.generate', {
      title,
    })
  }

  removeAccessToken(): void {
    socket.emit('user.keys.accessToken.remove', { title: this.tokenToRemove })

    queryClient.setQueryData<string[]>(queries.user.accessTokens.queryKey, (oldData) => {
      if (!oldData) return []

      return oldData.filter((item) => item !== this.tokenToRemove)
    })
  }

  private onAccessTokenGenerated({ tokenId }: AccessTokenGeneratedMessage): void {
    this.generatedTokenId = tokenId
  }
}
