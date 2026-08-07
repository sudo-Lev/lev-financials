import { IconFileUpload } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function ImportPage() {
  return <PagePlaceholder icon={IconFileUpload} {...messages.pages.import} />
}
