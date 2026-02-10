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
 * 라우트 타입
 * - INTERNAL: 내부 라우트 (React Router 등)
 * - EXTERNAL: 외부 URL 또는 마이크로앱
 */
export type FinalRouteType = 'INTERNAL' | 'EXTERNAL'

/**
 * 메뉴 타입
 * - GROUP: 그룹 메뉴 (하위 메뉴 존재)
 * - LEAF: 리프 노드 (실제 기능)
 */
export type FinalMenuType = 'GROUP' | 'LEAF'

/**
 * 내부 라우트 (액션 코드 사용)
 */
export interface InternalRoute {
    routeType: 'INTERNAL'
    /** 액션 코드 */
    actionCode: ActionCode
}

/**
 * 외부 라우트 (URL 사용)
 */
export interface ExternalRoute {
    routeType: 'EXTERNAL'
    /** 외부 URL (프로덕션 주소) */
    url: string
    /** 마이크로앱 이름 (마이크로앱인 경우, 환경 설정에서 URL 결정) */
    microApp?: string
}

/**
 * 라우트 정보 (Discriminated Union)
 */
export type FinalRoute = InternalRoute | ExternalRoute

/**
 * 최종 메뉴 아이템 구조
 */
export interface FinalMenuItem {
    /** 고유 ID (선택, 없으면 name으로 key 사용) */
    id?: string

    /** 메뉴 이름 (표시용) */
    name: string

    /** 메뉴 타입 */
    menuType: FinalMenuType

    /** 정렬 순서 */
    sort?: number

    /** 아이콘 (React 컴포넌트 문자열 또는 아이콘 이름) */
    icon?: string

    /** 자식 메뉴 (GROUP 타입인 경우) */
    children?: FinalMenuItem[]

    /** 라우팅 정보 (LEAF 타입인 경우 필수) */
    route?: FinalRoute

    /** 추가 메타데이터 */
    metadata?: {
        [key: string]: unknown
    }
}

/**
 * 최종 메뉴 트리 (최상위 배열)
 */
export type FinalMenuTree = FinalMenuItem[]
