/**
 * 메뉴 핸들러 함수
 */

import type { FinalMenuItem } from '../types/finalMenuTypes'
import { isFinalMenuLeaf } from './typeGuards'
import { getExternalBaseUrl } from 'config'

/** url이 외부 URL(http로 시작)인지 판별 */
function isExternalUrl(url: string): boolean {
    return url.startsWith('http')
}

/**
 * 메뉴 클릭 핸들러 (FinalMenu용)
 *
 * @param menu - 클릭된 메뉴 아이템
 * @param source - 액션 소스
 * @param dispatch - Redux dispatch 함수 (선택, 마이크로앱 활성화용)
 */
export function handleFinalMenuClick(
    menu: FinalMenuItem,
    source: 'MENU' | 'BUTTON' | 'REMOTE' | 'SHORTCUT' | 'OTHER' = 'MENU',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: 내부 액션 dispatch용으로 사용 예정
    dispatch?: (action: unknown) => void,
): void {
    if (!isFinalMenuLeaf(menu)) {
        console.warn('[handleFinalMenuClick] Not a leaf node, ignoring click')
        return
    }

    // LEAF 타입은 url이 필수
    const url = menu.url
    if (!url) {
        console.warn('[handleFinalMenuClick] No url found for leaf node')
        return
    }

    if (isExternalUrl(url)) {
        // 외부 URL: 절대 경로 그대로 사용
        const baseUrl = getExternalBaseUrl()
        console.log('[handleFinalMenuClick] External route:', url, {
            baseUrl,
            originalUrl: url,
        })
        window.open(url, '_blank')
    } else {
        // 내부 액션: actionCode
        console.log('[handleFinalMenuClick] Internal action:', url, {
            source,
            menu,
        })
        // TODO: 각 리듀서의 액션을 dispatch
        // 예: dispatch(MeasurementAction.executeDistancePlane())
    }
}
