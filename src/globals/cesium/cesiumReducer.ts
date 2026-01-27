import { PayloadAction } from '@reduxjs/toolkit'
import { reduxMaker } from 'src/globals/store/redux/reduxUtils.ts'

const prefix = 'cesium'

const localState = {
    baseUrl:
        typeof CESIUM_BASE_URL !== 'undefined'
            ? CESIUM_BASE_URL
            : '/cesiumStatic',
    isInitialized: false,
    isLoading: false,
    error: null as string | null,
}

// Window 인터페이스 확장
declare global {
    interface Window {
        CESIUM_BASE_URL?: string
    }
}

const localReducers = {
    setBaseUrl: (state: typeof localState, action: PayloadAction<string>) => {
        state.baseUrl = action.payload
        // Cesium 라이브러리 호환성을 위해 window에도 설정
        if (typeof window !== 'undefined') {
            window.CESIUM_BASE_URL = action.payload
        }
    },
    setInitialized: (
        state: typeof localState,
        action: PayloadAction<boolean>,
    ) => {
        state.isInitialized = action.payload
    },
    setLoading: (state: typeof localState, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload
    },
    setError: (
        state: typeof localState,
        action: PayloadAction<string | null>,
    ) => {
        state.error = action.payload
    },
    reset: (state: typeof localState) => {
        state.isInitialized = false
        state.isLoading = false
        state.error = null
    },
}

const module = reduxMaker(prefix, [], localState, localReducers)

export const {
    slice: cesiumSlice,
    actions: cesiumAction,
    saga: cesiumSaga,
} = module
