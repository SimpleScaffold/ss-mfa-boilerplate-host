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
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@repo/packages/fe-ui/drawer'

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
        <Drawer direction="right" shouldScaleBackground={false}>
            <DrawerTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    aria-label="테마·색상 설정"
                >
                    <Palette className="h-5 w-5" />
                </Button>
            </DrawerTrigger>

            <DrawerContent className="border-border fixed top-0 right-0 bottom-0 left-auto z-50 mt-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col rounded-none border-l">
                <DrawerHeader className="border-border border-b text-left">
                    <DrawerTitle className="border-border flex items-center justify-between gap-4 border-b pb-4">
                        <span>색상 설정</span>
                        <HostThemeSwitch />
                    </DrawerTitle>
                    <DrawerDescription className="sr-only">
                        디자인 토큰(CSS 변수)을 현재 라이트/다크 테마에 맞게
                        조정합니다.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
                    <HostThemeColorPickers />
                </div>

                <DrawerFooter className="border-border border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            handleReset(theme)
                        }}
                    >
                        초기화
                    </Button>
                    <DrawerClose asChild>
                        <Button type="button" variant="outline">
                            닫기
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
