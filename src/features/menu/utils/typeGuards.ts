/**
 * 메뉴 타입 가드 함수
 */

import type { FinalMenuItem } from '../types/finalMenuTypes'

/**
 * FinalMenuItem이 리프 노드인지 확인
 *
 * @param menu - 확인할 FinalMenuItem
 */
export function isFinalMenuLeaf(menu: FinalMenuItem): boolean {
    return (
        menu.menuType === 'LEAF' || !menu.children || menu.children.length === 0
    )
}
