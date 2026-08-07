import { IconSettings } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function SettingsPage() {
  return <PagePlaceholder icon={IconSettings} {...messages.pages.settings} />
}
