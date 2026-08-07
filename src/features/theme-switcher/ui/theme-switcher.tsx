import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

import { type Theme, useTheme } from '@/app/providers/theme-provider'
import { messages } from '@/shared/i18n'
import { Button } from '@/shared/ui'

const nextTheme: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const themeMeta = {
  system: { label: messages.theme.system, Icon: IconDeviceDesktop },
  light: { label: messages.theme.light, Icon: IconSun },
  dark: { label: messages.theme.dark, Icon: IconMoon },
} satisfies Record<Theme, { label: string; Icon: typeof IconSun }>

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const { Icon, label } = themeMeta[theme]

  return (
    <Button
      aria-label={`${messages.theme.change}: ${label}`}
      className="w-full justify-start group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0!"
      size="sm"
      type="button"
      variant="ghost"
      onClick={() => setTheme(nextTheme[theme])}
    >
      <Icon aria-hidden="true" />
      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
    </Button>
  )
}
