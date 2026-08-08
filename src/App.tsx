import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router'

import { appRouter } from '@/app/router/router'

const DevelopmentAgentation =
  import.meta.env.DEV && import.meta.env.MODE !== 'test'
    ? lazy(async () => {
        const { Agentation } = await import('agentation')

        return { default: Agentation }
      })
    : null

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
      {DevelopmentAgentation ? (
        <Suspense fallback={null}>
          <DevelopmentAgentation />
        </Suspense>
      ) : null}
    </>
  )
}

export default App
