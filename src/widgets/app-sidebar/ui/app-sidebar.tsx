import {
  IconCategory,
  IconFileUpload,
  IconLayoutDashboard,
  IconListDetails,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react'
import { Fragment } from 'react'
import { NavLink, useLocation } from 'react-router'

import { paths } from '@/app/router/paths'
import { ThemeSwitcher } from '@/features/theme-switcher/ui/theme-switcher'
import { messages } from '@/shared/i18n'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/shared/ui'

const navigationSections = [
  {
    label: messages.navigation.finance,
    items: [
      { label: messages.navigation.overview, path: paths.overview, Icon: IconLayoutDashboard },
      { label: messages.navigation.transactions, path: paths.transactions, Icon: IconListDetails },
      { label: messages.navigation.categories, path: paths.categories, Icon: IconCategory },
    ],
  },
  {
    label: messages.navigation.tools,
    items: [
      { label: messages.navigation.recurring, path: paths.recurring, Icon: IconRefresh },
      { label: messages.navigation.import, path: paths.import, Icon: IconFileUpload },
    ],
  },
  {
    label: messages.navigation.system,
    items: [{ label: messages.navigation.settings, path: paths.settings, Icon: IconSettings }],
  },
] as const

export function AppSidebar() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-3">
        <NavLink
          aria-label={messages.app.name}
          className="flex min-h-11 items-center gap-3 overflow-hidden rounded-lg px-2 outline-none ring-sidebar-ring focus-visible:ring-2"
          to={paths.overview}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary font-display text-primary-foreground text-sm tracking-[-0.03em]">
            {messages.app.shortName}
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-display text-lg leading-none tracking-[-0.025em]">
              Lev Financials
            </span>
            <span className="mt-1 block truncate font-mono text-[0.62rem] text-sidebar-foreground/60 uppercase tracking-[0.12em]">
              Personal ledger
            </span>
          </span>
        </NavLink>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navigationSections.map((section, sectionIndex) => (
          <Fragment key={section.label}>
            {sectionIndex > 0 ? (
              <SidebarSeparator className="mx-3 my-1 w-auto bg-sidebar-foreground/15" />
            ) : null}
            <SidebarGroup>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map(({ Icon, label, path }) => (
                    <SidebarMenuItem key={path}>
                      <SidebarMenuButton asChild isActive={pathname === path} tooltip={label}>
                        <NavLink
                          end={path === paths.overview}
                          to={path}
                          onClick={() => setOpenMobile(false)}
                        >
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <ThemeSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
