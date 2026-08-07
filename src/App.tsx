import './App.css'

function App() {
  return (
    <main className="foundation-screen">
      <div className="foundation-screen__grid" aria-hidden="true" />
      <section className="foundation-screen__content">
        <p className="foundation-screen__eyebrow">Lev Financials / 00</p>
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
