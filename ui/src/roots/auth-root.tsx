import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as DIContainerProvider } from 'inversify-react'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'

import { ThemeProvider } from '@/components/app/providers/theme-provider'
import { AuthPage } from '@/components/views/auth-page'

import { enableMocking } from '@/__mocks__/enable-mocking'
import { queryClient } from '@/config/queries/query-client'
import { globalContainer } from '@/config/inversify/global-container'
import '@/styles/index.css'
import '@vkontakte/vkui/dist/cssm/styles/themes.css'
import '@/config/i18n/i18n'
import { useTheme } from '@/lib/hooks/use-theme.hook'

const AuthApp = () => {
  const { theme } = useTheme()

  return (
    <ConfigProvider colorScheme={theme === 'system' ? undefined : theme} platform='vkcom'>
      <AdaptivityProvider>
        <AppRoot>
          <AuthPage />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <DIContainerProvider container={globalContainer}>
          <ThemeProvider>
            <AuthApp />
          </ThemeProvider>
        </DIContainerProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
})
