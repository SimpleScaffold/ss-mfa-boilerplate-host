import { useEffect } from 'react'

/**
 * 새로고침 시 preload 애니메이션/임시 배경색 제거.
 * double rAF로 레이아웃 안정화 후 스타일 정리.
 */
export function usePreloadCleanup() {
    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const root = document.documentElement
                const computedBg =
                    getComputedStyle(root).getPropertyValue('--background')

                if (computedBg?.trim()) {
                    root.style.backgroundColor = ''
                    document.body.classList.remove('preload')
                    root.classList.remove('theme-instant')
                }
            })
        })
    }, [])
}
