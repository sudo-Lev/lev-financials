import { IconCategory } from '@tabler/icons-react'

import { messages } from '@/shared/i18n'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

export function CategoriesPage() {
  return <PagePlaceholder icon={IconCategory} {...messages.pages.categories} />
}
