import type { RootState } from './reduxStore'
import type { MeasurementState } from 'src/features/function/measurement/measurementReducer'

/** 측정 effect 훅에 필요한 값 */
export interface MeasurementEffectPayload {
    isActive: boolean
    activeMeasurementType: MeasurementState['activeMeasurementType']
    unit: string
}

const DEFAULT: MeasurementEffectPayload = {
    isActive: false,
    activeMeasurementType: null,
    unit: 'm',
} as const

function getUnit(opts: MeasurementState['measurementOptions']): string {
    const u = opts?.unit
    return typeof u === 'string' ? u : 'm'
}

export function selectMeasurementForEffect(
    state: RootState,
): MeasurementEffectPayload {
    const slice = state.measurementReducer as MeasurementState | undefined
    if (!slice) return DEFAULT
    return {
        isActive: slice.isActive,
        activeMeasurementType: slice.activeMeasurementType,
        unit: getUnit(slice.measurementOptions),
    }
}
