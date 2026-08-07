import { IconRefresh } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function RecurringPage() {
  return <PagePlaceholder icon={IconRefresh} {...messages.pages.recurring} />
}
