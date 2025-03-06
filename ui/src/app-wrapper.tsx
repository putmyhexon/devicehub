import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'

import { useTheme } from '@/lib/hooks/use-theme.hook'

import type { ReactNode } from 'react'

export const AppWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()

  return (
    <ConfigProvider colorScheme={theme === 'system' ? undefined : theme} platform='vkcom'>
      <AdaptivityProvider>
        <AppRoot>{children}</AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
