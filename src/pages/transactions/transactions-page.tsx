import { IconListDetails } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function TransactionsPage() {
  return <PagePlaceholder icon={IconListDetails} {...messages.pages.transactions} />
}
