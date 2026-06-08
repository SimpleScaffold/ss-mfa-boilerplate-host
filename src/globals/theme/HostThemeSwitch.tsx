import { Moon, Sun } from 'lucide-react'

import { Switch } from '@repo/packages/fe-ui/switch'

import { useTheme } from './theme-provider.tsx'

/**
 * 셸 레이아웃 상단용 라이트/다크 전환 (보일러플레이트 SSdarkmodeSwitch와 동일 역할)
 */
export const HostThemeSwitch = () => {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-2">
            <Sun className="text-muted-foreground h-4 w-4" aria-hidden />
            <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked: boolean) => {
                    setTheme(checked ? 'dark' : 'light')
                }}
                aria-label="다크 모드"
            />
            <Moon className="text-muted-foreground h-4 w-4" aria-hidden />
        </div>
    )
}
