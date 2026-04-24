import {
    type ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { useDispatch } from 'react-redux'

import {
    hexToOklch,
    oklchToHex,
} from '../../../../../../../packages/fe/utils/color/colorUtils.tsx'

import { themeAction } from './themeReducer.tsx'

type HostThemeColorPickerProps = {
    variableKey: string
    color: string | undefined
    onChange: (color: string) => void
    label: string
}

const DEBOUNCE_MS = 200

export const HostThemeColorPicker = ({
    variableKey,
    color,
    onChange,
    label,
}: HostThemeColorPickerProps) => {
    const [localColor, setLocalColor] = useState(() =>
        color ? hexToOklch(color) : '',
    )
    const dispatch = useDispatch()
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setLocalColor(color ? hexToOklch(color) : '')
    }, [color])

    const scheduleUpdate = useCallback(
        (key: string, value: string) => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null
                dispatch(themeAction.setColor({ key, value }))
                onChange(value)
            }, DEBOUNCE_MS)
        },
        [dispatch, onChange],
    )

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newColor = hexToOklch(e.target.value)
        setLocalColor(newColor)
        scheduleUpdate(variableKey, newColor)
    }

    const displayHexColor = useMemo(() => {
        if (!localColor) {
            return '#808080'
        }
        if (localColor.startsWith('#')) {
            return localColor
        }
        return oklchToHex(localColor)
    }, [localColor])

    const inputId = `theme-color-${variableKey.replace(/[^a-zA-Z0-9-]/g, '-')}`

    return (
        <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={inputId} className="text-xs font-medium">
                    {label}
                </label>
            </div>
            <div className="flex items-center gap-1">
                <div
                    className="border-input relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border"
                    style={{
                        backgroundColor: localColor || 'transparent',
                    }}
                >
                    <input
                        type="color"
                        id={inputId}
                        value={displayHexColor}
                        onChange={handleColorChange}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                </div>
                <span className="border-input/20 bg-input/25 h-8 flex-1 rounded border px-2 font-mono text-sm leading-8">
                    {localColor || '—'}
                </span>
            </div>
        </div>
    )
}
