import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ImportPage } from './import-page'

describe('ImportPage', () => {
  it('shows a local-ready state for an accepted statement file', async () => {
    const user = userEvent.setup()
    render(<ImportPage />)

    await user.upload(
      screen.getByLabelText('Вибрати виписку для імпорту'),
      new File(['synthetic statement'], 'statement.pdf', { type: 'application/pdf' }),
    )

    expect(await screen.findByText('statement.pdf')).toBeInTheDocument()
    expect(screen.getByText('Готово до перевірки')).toBeInTheDocument()
    expect(
      screen.getByText('Файл не залишає цей браузер. Ми не відправляємо виписки на сервер.'),
    ).toBeInTheDocument()
  })

  it('explains why an unsupported local file was not accepted', async () => {
    render(<ImportPage />)

    fireEvent.change(screen.getByLabelText('Вибрати виписку для імпорту'), {
      target: { files: [new File(['synthetic statement'], 'statement.txt')] },
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Підтримуються лише PDF, XLSX та CSV файли.',
    )
  })
})
