// 테마 관련 유틸리티 함수들
import type { ResolvedTheme } from 'src/globals/theme/theme-provider.tsx'
import store from 'src/globals/store/redux/reduxStore.tsx'
import { themeAction } from 'src/globals/theme/themeReducer.tsx'

const VARS_KEY = 'vite-ui-theme-vars'

type StoredThemeVars = {
    lightVars?: Record<string, string>
    darkVars?: Record<string, string>
}

const parseStoredThemeVars = (raw: string): StoredThemeVars => {
    return JSON.parse(raw) as StoredThemeVars
}

// lightVars, darkVars 를 로컬 스토리지 에서 들고옴
export const getCustomVarsFromLocalStorage = (): {
    lightVars: Record<string, string>
    darkVars: Record<string, string>
} => {
    try {
        const raw = localStorage.getItem(VARS_KEY)
        if (!raw) {
            return { lightVars: {}, darkVars: {} }
        }
        const parsed = parseStoredThemeVars(raw)
        return {
            lightVars: parsed.lightVars ?? {},
            darkVars: parsed.darkVars ?? {},
        }
    } catch {
        console.warn('Invalid vite-ui-theme-vars format in localStorage')
        return { lightVars: {}, darkVars: {} }
    }
}

export const saveThemeVar = (
    theme: ResolvedTheme,
    key: string,
    value: string,
) => {
    const raw = localStorage.getItem(VARS_KEY)
    const parsed: StoredThemeVars = raw ? parseStoredThemeVars(raw) : {}
    const themeKey = theme === 'dark' ? 'darkVars' : 'lightVars'

    const existingVars = parsed[themeKey] ?? {}
    const updated: StoredThemeVars = {
        ...parsed,
        [themeKey]: {
            ...existingVars,
            [key]: value,
        },
    }

    localStorage.setItem(VARS_KEY, JSON.stringify(updated))
}

// 변경된 테마를 적용
export const applyThemeVariables = (theme: ResolvedTheme) => {
    const root = document.documentElement

    const { lightVars = {}, darkVars = {} } = getCustomVarsFromLocalStorage()
    const vars = theme === 'dark' ? darkVars : lightVars

    // 적용 전에 변수에 값 있는 색 비우기
    clearThemeVariables()

    // localStorage에 해당 테마 정보가 없으면 CSS 기본값 그대로 유지
    if (!vars || Object.keys(vars).length === 0) {
        return
    }

    // localStorage에 있는 변수만 적용
    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
    })
}

// 현재 css 청소
export const clearThemeVariables = () => {
    const root = document.documentElement
    const { lightVars, darkVars } = getCustomVarsFromLocalStorage()

    const allKeys = new Set([
        ...Object.keys(lightVars || {}),
        ...Object.keys(darkVars || {}),
    ])

    allKeys.forEach((key) => {
        root.style.removeProperty(key)
    })
}

// 특정 테마를 리셋함
export const handleReset = (theme: ResolvedTheme) => {
    const raw = localStorage.getItem(VARS_KEY)
    if (!raw) return

    const parsed = parseStoredThemeVars(raw)
    const themeKey = theme === 'dark' ? 'darkVars' : 'lightVars'
    const varsToReset = parsed[themeKey] ?? {}

    const allKeys = new Set(Object.keys(varsToReset))

    delete parsed[themeKey]
    localStorage.setItem(VARS_KEY, JSON.stringify(parsed))

    const root = document.documentElement
    allKeys.forEach((key) => {
        root.style.removeProperty(key)
    })
    applyThemeVariables(theme)

    store.dispatch(themeAction.setColors())
}
