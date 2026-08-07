import type { PropsWithChildren } from 'react'

import { Toaster, TooltipProvider } from '@/shared/ui'

import { ThemeProvider } from './theme-provider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <TooltipProvider delay={120}>
        {children}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
