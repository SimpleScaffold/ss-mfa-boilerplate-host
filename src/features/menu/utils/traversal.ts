/**
 * 메뉴 트리 순회 및 탐색 함수
 */

import type { FinalMenuItem, FinalMenuTree } from '../types/finalMenuTypes'
import { isFinalMenuLeaf } from './typeGuards'

/**
 * FinalMenu 트리에서 특정 ID의 메뉴 찾기
 *
 * @param menuTree - 검색할 FinalMenu 트리
 * @param targetId - 찾을 메뉴 ID
 */
export function findFinalMenuItem(
    menuTree: FinalMenuTree,
    targetId: string,
): FinalMenuItem | null {
    function search(items: FinalMenuItem[]): FinalMenuItem | null {
        for (const item of items) {
            const { id, children }: { id?: string; children?: unknown[] } = item
            if (id === targetId) {
                return item
            }
            if (Array.isArray(children) && children.length > 0) {
                const found = search(children as FinalMenuItem[])
                if (found) {
                    return found
                }
            }
        }
        return null
    }
    return search(menuTree)
}

/**
 * FinalMenu 트리에서 모든 리프 노드 찾기
 *
 * @param menuTree - 검색할 FinalMenu 트리
 */
export function findAllFinalMenuLeaves(
    menuTree: FinalMenuTree,
): FinalMenuItem[] {
    const leaves: FinalMenuItem[] = []

    function traverse(items: FinalMenuItem[]) {
        for (const item of items) {
            if (isFinalMenuLeaf(item)) {
                leaves.push(item)
            } else {
                const { children }: { children?: unknown[] } = item
                if (Array.isArray(children) && children.length > 0) {
                    traverse(children as FinalMenuItem[])
                }
            }
        }
    }

    traverse(menuTree)
    return leaves
}
