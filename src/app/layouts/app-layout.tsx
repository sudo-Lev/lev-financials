import { IconLock } from '@tabler/icons-react'
import { Outlet, useLocation } from 'react-router'

import { paths } from '@/app/router/paths'
import { messages } from '@/shared/i18n'
import { Badge, Separator, SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/ui'
import { AppSidebar } from '@/widgets/app-sidebar/ui/app-sidebar'

const pageTitles: Record<string, string> = {
  [paths.overview]: messages.navigation.overview,
  [paths.transactions]: messages.navigation.transactions,
  [paths.categories]: messages.navigation.categories,
  [paths.recurring]: messages.navigation.recurring,
  [paths.import]: messages.navigation.import,
  [paths.settings]: messages.navigation.settings,
}

export function AppLayout() {
  const { pathname } = useLocation()
  const pageTitle = pageTitles[pathname] ?? messages.navigation.overview

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden bg-background md:min-h-[calc(100svh-1rem)]">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/88 px-4 backdrop-blur-xl md:px-6">
          <SidebarTrigger aria-label="Відкрити навігацію" />
          <Separator className="h-4" orientation="vertical" />
          <span className="min-w-0 truncate font-medium text-sm">{pageTitle}</span>
          <Badge className="ml-auto hidden gap-1.5 sm:inline-flex" variant="outline">
            <IconLock aria-hidden="true" className="size-3" />
            {messages.app.localOnly}
          </Badge>
        </header>

        <div className="app-surface flex min-h-[calc(100svh-3.5rem)] flex-1 px-5 sm:px-8 md:min-h-[calc(100svh-4.5rem)] lg:px-12">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
