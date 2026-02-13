/**
 * 최종 메뉴 구조 타입 정의
 * 앞으로 사용할 표준 메뉴 구조
 */

/**
 * 액션 코드 타입
 * [도메인]_[행위] 형식
 */
export type ActionCode = string

/**
 * 메뉴 타입
 * - GROUP: 그룹 메뉴 (하위 메뉴 존재)
 * - LEAF: 리프 노드 (실제 기능)
 */
export type FinalMenuType = 'GROUP' | 'LEAF'

/**
 * LEAF 메뉴의 url 타입
 * - 내부(INTERNAL): actionCode (예: 'executeDistancePlane')
 * - 외부(EXTERNAL): 전체 URL (예: 'http://...')
 */
export type LeafUrl = string

/**
 * 최종 메뉴 아이템 구조
 */
export interface FinalMenuItem {
    /** 고유 ID (선택, 없으면 name으로 key 사용) */
    id?: string

    /** 메뉴 이름 (표시용) */
    name: string

    /** 메뉴 타입 (GROUP | LEAF) */
    type: FinalMenuType

    /** 정렬 순서 */
    sort?: number

    /** 아이콘 (React 컴포넌트 문자열 또는 아이콘 이름) */
    icon?: string

    /** 자식 메뉴 (GROUP 타입인 경우) */
    children?: FinalMenuItem[]

    /** URL (LEAF 전용 - 내부: actionCode, 외부: 전체 URL) */
    url?: LeafUrl

    /** 추가 메타데이터 */
    metadata?: {
        [key: string]: unknown
    }
}

/**
 * 최종 메뉴 트리 (최상위 배열)
 */
export type FinalMenuTree = FinalMenuItem[]
