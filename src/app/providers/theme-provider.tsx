import {
  createContext,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

export type Theme = 'dark' | 'light' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = 'lev-financials-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function getStoredTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  return storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system'
    ? storedTheme
    : 'system'
}

function getResolvedTheme(theme: Theme): Exclude<Theme, 'system'> {
  if (theme !== 'system') {
    return theme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useLayoutEffect(() => {
    const root = window.document.documentElement
    const resolvedTheme = getResolvedTheme(theme)

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme має використовуватися всередині ThemeProvider')
  }

  return context
}
