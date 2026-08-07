import { IconLayoutDashboard } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function OverviewPage() {
  return <PagePlaceholder icon={IconLayoutDashboard} {...messages.pages.overview} />
}
