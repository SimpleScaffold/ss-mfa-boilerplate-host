/** `index.html` 조기 테마 스크립트와 동일한 키 */
export const THEME_STORAGE_KEY = 'vite-ui-theme'

export type ThemePreference = 'light' | 'dark' | 'system'

export const themeConfig = {
    defaultTheme: 'light' as const,
    themes: ['light', 'dark', 'system'] as const,
}
