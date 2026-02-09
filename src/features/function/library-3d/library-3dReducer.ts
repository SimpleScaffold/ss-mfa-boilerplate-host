import { PayloadAction } from '@reduxjs/toolkit'
import { reduxMaker, AsyncRequest } from 'src/globals/store/redux/reduxUtils.ts'

const prefix = 'function_library-3d'

/**
 * 기능 > 3D라이브러리 리듀서
 *
 * 생성일: 2026-02-09
 */

/**
 * 비동기 요청 정의
 */
const asyncRequests = [
    // TODO: 필요한 비동기 액션 추가
] as const satisfies AsyncRequest<unknown, unknown>[]

/**
 * 로컬 상태
 */
const localState = {
    // 활성화 상태
    isActive: false,

    // 데이터
    data: null as unknown,

    // 로딩 상태
    isLoading: false,

    // 에러 상태
    error: null as string | null,
}

/**
 * 로컬 리듀서
 */
const localReducers = {
    /**
     * 활성화 상태 설정
     */
    setActive: (state: typeof localState, action: PayloadAction<boolean>) => {
        state.isActive = action.payload
    },

    /**
     * 로딩 상태 설정
     */
    setLoading: (state: typeof localState, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload
    },

    /**
     * 에러 상태 설정
     */
    setError: (
        state: typeof localState,
        action: PayloadAction<string | null>,
    ) => {
        state.error = action.payload
    },
}

const module = reduxMaker(prefix, asyncRequests, localState, localReducers)

export const {
    slice: Library3dSlice,
    actions: Library3dAction,
    saga: Library3dSaga,
} = module
