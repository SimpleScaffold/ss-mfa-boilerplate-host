/**
 * 최종 메뉴 구조 타입 정의
 * @repo/packages/fe-ui DSsideMenu와 호환되는 타입
 */

export type FinalMenuType = 'GROUP' | 'LEAF'

export interface FinalMenuItem {
    id?: string
    name: string
    type: FinalMenuType
    sort?: number
    icon?: string
    children?: FinalMenuItem[]
    url?: string
    metadata?: {
        [key: string]: unknown
    }
}

export type FinalMenuTree = FinalMenuItem[]
