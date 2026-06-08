import { useEffect } from 'react'
import { Palette } from 'lucide-react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@repo/packages/fe-ui/accordion'
import { Button } from '@repo/packages/fe-ui/button'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@repo/packages/fe-ui/sheet'

import type { RootState } from 'src/globals/store/redux/reduxStore.tsx'

import { colorGroups } from './colorConstants.tsx'
import { HostThemeSwitch } from './HostThemeSwitch.tsx'
import { HostThemeColorPicker } from './HostThemeColorPicker.tsx'
import {
    applyThemeVariables,
    handleReset,
    saveThemeVar,
} from './themeUtils.tsx'
import { themeAction } from './themeReducer.tsx'
import { useTheme } from './theme-provider.tsx'

const HostThemeColorPickers = () => {
    const { theme } = useTheme()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(themeAction.setColors())
    }, [theme, dispatch])

    const { colors } = useSelector(
        (state: RootState) => ({
            colors: state.themeReducer.colors,
        }),
        shallowEqual,
    )

    const handleColorChange = (key: string) => (color: string) => {
        saveThemeVar(theme, key, color)
        applyThemeVariables(theme)
    }

    return (
        <Accordion type="multiple" className="w-full pb-4">
            {colorGroups.map((group, idx) => (
                <AccordionItem key={group.label} value={`group-${idx}`}>
                    <AccordionTrigger>{group.label}</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            {group.keys.map((key) => (
                                <HostThemeColorPicker
                                    key={key}
                                    variableKey={key}
                                    color={colors[key]}
                                    label={key
                                        .replace('--', '')
                                        .replace(/-/g, ' ')
                                        .toLowerCase()}
                                    onChange={handleColorChange(key)}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

/**
 * CSS 변수(테마 토큰) 커스터마이즈 — 보일러플레이트 `SScolorDrawer`와 동일 역할
 */
export const HostThemeSettingsDrawer = () => {
    const { theme } = useTheme()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="테마·색상 설정"
                >
                    <Palette className="h-5 w-5" />
                </Button>
            </SheetTrigger>

            <SheetContent
                hideCloseButton
                side="right"
                className="border-border bg-background flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col gap-0 overflow-hidden rounded-l-xl border-l p-0 shadow-xl sm:max-w-md"
            >
                <SheetHeader className="grid shrink-0 gap-1.5 p-4 text-left sm:text-left">
                    <SheetTitle className="border-border flex items-center justify-between gap-4 border-b pb-4 text-lg leading-none font-semibold tracking-tight">
                        <span>색상 설정</span>
                        <HostThemeSwitch />
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        디자인 토큰(CSS 변수)을 현재 라이트/다크 테마에 맞게
                        조정합니다.
                    </SheetDescription>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-4">
                    <HostThemeColorPickers />
                </div>

                <SheetFooter className="border-border bg-muted/30 mt-auto flex w-full shrink-0 flex-col gap-2 border-t p-4 sm:flex-col sm:justify-stretch sm:space-x-0">
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => {
                            handleReset(theme)
                        }}
                    >
                        초기화
                    </Button>
                    <SheetClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                        >
                            닫기
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
