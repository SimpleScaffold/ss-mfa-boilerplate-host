import { AxiosResponse } from 'axios'
import { MOCK_MENU_DATA } from './data/menuMockData'
import type { FinalMenuTree } from './types/finalMenuTypes'

/**
 * 메뉴 목록 조회 API
 */
export const getBaseMenu = () // payload?: void,
: Promise<AxiosResponse<FinalMenuTree>> => {
    // TODO: 실제 API 연동 시 아래 주석 해제
    // return client.get('/orders', { params: payload })

    // 더미데이터 반환 (실제 API 연동 전까지 사용)
    return Promise.resolve({
        data: MOCK_MENU_DATA,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
    }) as Promise<AxiosResponse<FinalMenuTree>>
}
