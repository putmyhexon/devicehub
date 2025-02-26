export const OPENSTF_API_ROUTES = {
  devices: '/devices',
  groups: '/groups',
  users: '/users',
  user: '/user',
  accessTokens: '/user/accessTokens',
  groupUser: (id: string, email?: string) => (email ? `/groups/${id}/users/${email}` : `/groups/${id}/users`),
  groupDevice: (id: string, serial?: string) => (serial ? `/groups/${id}/devices/${serial}` : `/groups/${id}/devices`),
  deviceGroup: (id: string, serial?: string) => (serial ? `/devices/${serial}/groups/${id}` : `/devices/groups/${id}`),
} as const
