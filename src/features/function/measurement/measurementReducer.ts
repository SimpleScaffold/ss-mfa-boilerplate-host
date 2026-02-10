import { PayloadAction } from '@reduxjs/toolkit'
import { reduxMaker, AsyncRequest } from 'src/globals/store/redux/reduxUtils.ts'

const prefix = 'function_measurement'

/**
 * 기능 > 측정기능 리듀서
 *
 * 생성일: 2026-02-09
 */

export type MeasurementType =
    | 'plane'
    | 'space'
    | 'vertical'
    | 'area'
    | 'elevation'
    | 'volume'
    | null

/** 측정 Redux slice 상태 타입 */
export interface MeasurementState {
    isActive: boolean
    activeMeasurementType: MeasurementType
    measurementOptions: { unit?: string }
    data: unknown
    isLoading: boolean
    error: string | null
}

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

    // 현재 활성 측정 유형 (평면/공간/수직/면적/표고/부피)
    activeMeasurementType: null as MeasurementType,

    // 측정 옵션 (단위 등)
    measurementOptions: {} as Record<string, unknown>,

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

    /**
     * 평면거리 측정 실행
     * - activeMeasurementType을 'plane'으로 설정하여 useMeasurementEffect에서
     *   Cesium 평면 거리 측정(startPlaneDistanceMeasurement)을 구동
     */
    executeDistancePlane: (
        state: typeof localState,
        action: PayloadAction<{ unit?: string }>,
    ) => {
        const { unit = 'm' } = action.payload ?? {}
        state.isActive = true
        state.activeMeasurementType = 'plane'
        state.measurementOptions = { unit }
        state.error = null
    },

    /**
     * 측정 모드만 비활성화 (결과는 유지)
     */
    setInactive: (state: typeof localState, _action: PayloadAction<void>) => {
        state.isActive = false
        state.activeMeasurementType = null
    },

    /**
     * 공간거리 측정 실행
     */
    executeDistanceSpace: (
        state: typeof localState,
        action: PayloadAction<{ unit?: string }>,
    ) => {
        console.log(
            '[Measurement] Starting space distance measurement',
            action.payload,
        )
        state.isActive = true
        // 실제 측정 로직 구현
    },

    /**
     * 수직거리 측정 실행
     */
    executeDistanceVertical: (
        state: typeof localState,
        action: PayloadAction<{ unit?: string }>,
    ) => {
        console.log(
            '[Measurement] Starting vertical distance measurement',
            action.payload,
        )
        state.isActive = true
        // 실제 측정 로직 구현
    },

    /**
     * 면적 측정 실행
     */
    executeArea: (
        state: typeof localState,
        action: PayloadAction<{ precision?: number }>,
    ) => {
        console.log('[Measurement] Starting area measurement', action.payload)
        state.isActive = true
        // 실제 측정 로직 구현
    },

    /**
     * 표고 측정 실행
     */
    executeElevation: (
        state: typeof localState,
        action: PayloadAction<void>,
    ) => {
        console.log('[Measurement] Starting elevation measurement')
        state.isActive = true
        // 실제 측정 로직 구현
    },

    /**
     * 부피 측정 실행
     */
    executeVolume: (state: typeof localState, action: PayloadAction<void>) => {
        console.log('[Measurement] Starting volume measurement')
        state.isActive = true
        // 실제 측정 로직 구현
    },

    /**
     * 측정 결과 제거 및 측정 모드 해제
     */
    executeRemove: (state: typeof localState, action: PayloadAction<void>) => {
        state.data = null
        state.isActive = false
        state.activeMeasurementType = null
        state.measurementOptions = {}
    },
}

const module = reduxMaker(prefix, asyncRequests, localState, localReducers)

export const {
    slice: MeasurementSlice,
    actions: MeasurementAction,
    saga: MeasurementSaga,
} = module
