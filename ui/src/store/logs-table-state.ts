import { makeAutoObservable } from 'mobx'

class LogsTableState {
  globalFilter = ''

  constructor() {
    makeAutoObservable(this)
  }

  setGlobalFilter(filter: string): void {
    this.globalFilter = filter
  }
}

export const logsTableState = new LogsTableState()
