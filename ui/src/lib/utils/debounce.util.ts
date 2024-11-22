export const debounce = <T extends (...args: unknown[]) => void>(fn: T, ms: number): ((...args: unknown[]) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return function func(this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}
