import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from '@/App'
import { ThemeProvider } from '@/app/providers/theme-provider'

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  )
}

describe('App', () => {
  it('renders the Ukrainian application foundation', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: 'Фінанси без зайвого шуму.' })).toBeInTheDocument()
    expect(screen.getByText('React + TypeScript + Vite')).toBeInTheDocument()
  })

  it('switches and persists the selected theme', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Тема: Системна' }))

    expect(document.documentElement).toHaveClass('light')
    expect(window.localStorage.getItem('lev-financials-theme')).toBe('light')
  })
})
