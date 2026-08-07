import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { AppProviders } from '@/app/providers/app-providers'
import { appRoutes } from '@/app/router/router'

function renderRoute(initialEntry = '/') {
  const router = createMemoryRouter(appRoutes, { initialEntries: [initialEntry] })

  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { router }
}

describe('App', () => {
  it('renders the Ukrainian overview route', async () => {
    renderRoute()

    expect(await screen.findByRole('heading', { name: 'Огляд фінансів' })).toBeInTheDocument()
    expect(screen.getByText('Дані залишаються у браузері')).toBeInTheDocument()
  })

  it('navigates through the application shell', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute()

    await user.click(await screen.findByRole('link', { name: 'Транзакції' }))

    expect(await screen.findByRole('heading', { name: 'Транзакції' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/transactions')
  })

  it('switches and persists the selected theme', async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(await screen.findByRole('button', { name: 'Змінити тему: Системна' }))

    expect(document.documentElement).toHaveClass('light')
    expect(window.localStorage.getItem('lev-financials-theme')).toBe('light')
  })
})
