/**
 * 메뉴 핸들러 함수
 */

import type { FinalMenuItem } from '../types/finalMenuTypes'
import { isFinalMenuLeaf } from './typeGuards'
import { getExternalBaseUrl } from 'config'

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
    dispatch?: (action: unknown) => void,
): void {
    if (!isFinalMenuLeaf(menu)) {
        console.warn('[handleFinalMenuClick] Not a leaf node, ignoring click')
        return
    }

    // LEAF 타입은 route가 필수
    if (!menu.route) {
        console.warn('[handleFinalMenuClick] No route found for leaf node')
        return
    }

    const route = menu.route

    // Discriminated Union 타입 가드로 처리
    if (route.routeType === 'INTERNAL') {
        // 내부 라우트: actionCode가 필수로 보장됨
        console.log(
            '[handleFinalMenuClick] Internal action:',
            route.actionCode,
            {
                source,
                menu,
            },
        )
        // TODO: 각 리듀서의 액션을 dispatch
        // 예: dispatch(MeasurementAction.executeDistancePlane())
        // 파라미터는 각 리듀서의 액션 핸들러에서 필요에 따라 추가
    } else if (route.routeType === 'EXTERNAL') {
        // 외부 라우트: url이 필수로 보장됨
        // 마이크로앱인 경우
        if (route.microApp) {
            console.log('[handleFinalMenuClick] Micro app:', route.microApp, {
                url: route.url,
                source,
            })
            // 마이크로앱은 직접 렌더링하거나 다른 방식으로 관리
            // Redux state에 저장하지 않음
            console.log(
                '[handleFinalMenuClick] Micro app should be rendered:',
                route.microApp,
            )
        }
        // 일반 외부 URL
        else {
            // 환경 설정에서 base URL 가져오기
            const baseUrl = getExternalBaseUrl()
            // 상대 경로인 경우 base URL과 조합, 절대 URL인 경우 그대로 사용
            const fullUrl = route.url.startsWith('http')
                ? route.url
                : baseUrl
                  ? `${baseUrl}${route.url}`
                  : route.url

            console.log('[handleFinalMenuClick] External route:', fullUrl, {
                baseUrl,
                originalUrl: route.url,
            })
            // 새 창에서 열기
            window.open(fullUrl, '_blank')
        }
    }
}
