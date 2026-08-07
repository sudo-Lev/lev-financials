import { render, screen } from '@testing-library/react'

import App from '@/App'

describe('App', () => {
  it('renders the Ukrainian application foundation', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Фінанси без зайвого шуму.' })).toBeInTheDocument()
    expect(screen.getByText('React + TypeScript + Vite')).toBeInTheDocument()
  })
})
