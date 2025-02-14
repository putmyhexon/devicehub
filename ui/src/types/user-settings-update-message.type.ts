export type UserSettingsUpdateMessage = {
  user: {
    email: string
    name: string
    privilege: string
    groups: {
      quotas: {
        allocated: {
          duration: number
          number: number
        }
        consumed: {
          duration: number
          number: number
        }
        defaultGroupsDuration: number
        defaultGroupsNumber: number
        defaultGroupsRepetitions: number
        repetitions: number
      }
      subscribed: string[]
    }
    settings: {
      alertMessage: {
        activation: string
        data: string
        level: 'Information' | 'Warning' | 'Critical'
      }
    }
  }
  isAddedGroup: boolean
  groups: unknown[]
  action: string
  targets: string[]
  timeStamp: number
}
