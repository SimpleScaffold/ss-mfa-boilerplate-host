import type { FinalMenuTree } from '../types/finalMenuTypes'

/**
 * 메뉴 Mock 데이터
 * - type: GROUP | LEAF
 * - url: LEAF 전용
 *   - 모달 모듈: '{remoteName}/{path}' (예: remote/sample) → remotes name으로 해당 remote 매핑
 *   - 외부: http(s)로 시작하는 전체 URL
 *   - 기타 내부: actionCode
 */
export const MOCK_MENU_DATA: FinalMenuTree = [
    {
        name: 'Remote 샘플',
        type: 'GROUP',
        icon: 'Compass',
        children: [
            {
                name: '샘플',
                type: 'LEAF',
                url: 'remote/sample',
            },
            {
                name: '샘플(다중)',
                type: 'LEAF',
                url: 'remote/sample-multi',
            },
        ],
    },
]
