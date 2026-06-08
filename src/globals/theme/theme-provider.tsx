import React, {
    createContext,
    useContext,
    useLayoutEffect,
    useState,
    useSyncExternalStore,
} from 'react'

import { THEME_STORAGE_KEY, type ThemePreference } from './theme-config.ts'
import { applyThemeVariables } from './themeUtils.tsx'

export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
    /** 실제 적용 중인 라이트/다크 (`system`일 때 OS 설정 반영) */
    theme: ResolvedTheme
    /** 사용자가 선택한 값 (`light` | `dark` | `system`) */
    themePreference: ThemePreference
    setTheme: (next: ThemePreference) => void
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined,
)

function readStoredPreference(
    fallback: ThemePreference = 'system',
): ThemePreference {
    if (typeof window === 'undefined') {
        return fallback
    }
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
        return raw
    }
    return fallback
}

function subscribeSystemTheme(onChange: () => void) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
}

function getSystemIsDarkSnapshot() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getServerSystemSnapshot() {
    return false
}

function resolveTheme(
    preference: ThemePreference,
    systemIsDark: boolean,
): ResolvedTheme {
    if (preference === 'dark') {
        return 'dark'
    }
    if (preference === 'light') {
        return 'light'
    }
    return systemIsDark ? 'dark' : 'light'
}

export const ThemeProvider: React.FC<{
    children: React.ReactNode
    defaultTheme?: ThemePreference
}> = ({ children, defaultTheme }) => {
    const systemIsDark = useSyncExternalStore(
        subscribeSystemTheme,
        getSystemIsDarkSnapshot,
        getServerSystemSnapshot,
    )

    const [themePreference, setThemePreference] = useState<ThemePreference>(
        () => readStoredPreference(defaultTheme ?? 'system'),
    )

    const theme = resolveTheme(themePreference, systemIsDark)

    useLayoutEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem(THEME_STORAGE_KEY, themePreference)
        applyThemeVariables(theme)
    }, [theme, themePreference])

    const setTheme = (next: ThemePreference) => {
        setThemePreference(next)
    }

    const toggleTheme = () => {
        setThemePreference((prev) => {
            const resolved = resolveTheme(prev, getSystemIsDarkSnapshot())
            return resolved === 'dark' ? 'light' : 'dark'
        })
    }

    return (
        <ThemeContext.Provider
            value={{ theme, themePreference, setTheme, toggleTheme }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
