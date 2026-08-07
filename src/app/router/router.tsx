import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '@/app/layouts/app-layout'

import { paths } from './paths'
import { RouteFallback } from './route-fallback'

export const appRoutes = [
  {
    element: <AppLayout />,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const { OverviewPage } = await import('@/pages/overview/overview-page')
          return { Component: OverviewPage }
        },
      },
      {
        path: paths.transactions,
        lazy: async () => {
          const { TransactionsPage } = await import('@/pages/transactions/transactions-page')
          return { Component: TransactionsPage }
        },
      },
      {
        path: paths.categories,
        lazy: async () => {
          const { CategoriesPage } = await import('@/pages/categories/categories-page')
          return { Component: CategoriesPage }
        },
      },
      {
        path: paths.recurring,
        lazy: async () => {
          const { RecurringPage } = await import('@/pages/recurring/recurring-page')
          return { Component: RecurringPage }
        },
      },
      {
        path: paths.import,
        lazy: async () => {
          const { ImportPage } = await import('@/pages/import/import-page')
          return { Component: ImportPage }
        },
      },
      {
        path: paths.settings,
        lazy: async () => {
          const { SettingsPage } = await import('@/pages/settings/settings-page')
          return { Component: SettingsPage }
        },
      },
      { path: '*', element: <Navigate replace to={paths.overview} /> },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
