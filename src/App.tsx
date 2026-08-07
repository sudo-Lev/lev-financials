import './App.css'

import { type Theme, useTheme } from '@/app/providers/theme-provider'

const nextTheme: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const themeLabel: Record<Theme, string> = {
  system: 'Системна',
  light: 'Світла',
  dark: 'Темна',
}

function App() {
  const { setTheme, theme } = useTheme()

  return (
    <main className="foundation-screen">
      <div className="foundation-screen__grid" aria-hidden="true" />
      <section className="foundation-screen__content">
        <div className="foundation-screen__utility">
          <p className="foundation-screen__eyebrow">Lev Financials / 00</p>
          <button
            className="foundation-screen__theme-toggle"
            type="button"
            onClick={() => setTheme(nextTheme[theme])}
          >
            Тема: {themeLabel[theme]}
          </button>
        </div>
        <h1>Фінанси без зайвого шуму.</h1>
        <p className="foundation-screen__description">
          Локальний простір для виписок, категорій і зрозумілої картини витрат. Основа застосунку
          готова.
        </p>
        <div className="foundation-screen__status">
          <span aria-hidden="true" />
          React + TypeScript + Vite
        </div>
      </section>
    </main>
  )
}

export default App
