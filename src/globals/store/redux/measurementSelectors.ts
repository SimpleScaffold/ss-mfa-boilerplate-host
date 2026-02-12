import type { RootState } from './reduxStore'

/** 측정 effect 훅에 필요한 값 */
export interface MeasurementEffectPayload {
    isActive: boolean
    activeMeasurementType: string | null
    unit: string
}

const DEFAULT: MeasurementEffectPayload = {
    isActive: false,
    activeMeasurementType: null,
    unit: 'm',
} as const

export function selectMeasurementForEffect(
    _state: RootState,
): MeasurementEffectPayload {
    // TODO: measurementReducer 추가 시 연동
    return DEFAULT
}
