/**
 * 메뉴 변환 함수
 *
 * 원래는 여기서 메뉴 구조를 변환해야 하지만,
 * 현재는 임시 메뉴를 사용 중이므로 들어온 값을 그대로 반환합니다.
 * todo 나중에 실제 변환 로직이 필요하면 여기에 구현하세요.
 */

import type { FinalMenuTree } from '../types/finalMenuTypes'

/**
 * 메뉴를 FinalMenu로 변환
 *
 * 현재는 임시 메뉴를 사용 중이므로 들어온 값을 그대로 반환합니다.
 *
 * @param menu - 변환할 메뉴 데이터 (FinalMenuTree | null)
 * @returns FinalMenuTree
 */
export function convertToFinalMenu(menu: FinalMenuTree | null): FinalMenuTree {
    // 임시: 들어온 값을 그대로 반환
    return menu || []
}
