import { S_IFDIR, S_IFLNK, S_IFMT } from '@/constants/file-bit-masks'

export const formatPermissionMode = (value: number): string => {
  const permissionSymbols = ['x', 'w', 'r']

  let result = ''

  for (let i = 0; i < permissionSymbols.length; i++) {
    for (let j = 0; j < permissionSymbols.length; j++) {
      result = ((value >> (i * permissionSymbols.length + j)) & 1) !== 0 ? permissionSymbols[j] + result : '-' + result
    }
  }

  if ((value & S_IFMT) === S_IFDIR) {
    return `d${result}`
  }

  if ((value & S_IFMT) === S_IFLNK) {
    return `l${result}`
  }

  return `-${result}`
}
