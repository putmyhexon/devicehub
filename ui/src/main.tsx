import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { App } from '@/components/app/app'
import { ThemeProvider } from '@/components/app/providers/theme-provider'

import { queryClient } from '@/config/queries/query-client'

import { enableMocking } from './__mocks__/enable-mocking'

import '@/styles/index.css'
import '@vkontakte/vkui/dist/cssm/styles/themes.css'

import '@/config/i18n/i18n'

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
})
