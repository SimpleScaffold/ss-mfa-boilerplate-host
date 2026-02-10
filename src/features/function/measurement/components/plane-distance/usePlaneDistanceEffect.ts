import { useEffect, useRef } from 'react'
import { useAppDispatch } from 'src/globals/store/redux/reduxHooks'
import { cesiumViewerStore } from 'src/globals/cesium/cesiumStore'
import {
    startPlaneDistanceMeasurement,
    clearPlaneDistanceMeasurement,
} from './planeDistanceMeasurement'
import type { Unit } from './utils'
import { MeasurementAction } from '../../measurementReducer'

interface UsePlaneDistanceEffectParams {
    isActive: boolean
    unit: string
}

/**
 * 평면 거리 측정 효과 훅.
 * Redux 상태와 Cesium Viewer를 연동합니다.
 */
export function usePlaneDistanceEffect({
    isActive,
    unit,
}: UsePlaneDistanceEffectParams) {
    const dispatch = useAppDispatch()
    const cleanupRef = useRef<(() => void) | null>(null)
    const completedRef = useRef(false)

    useEffect(() => {
        const viewer = cesiumViewerStore.getViewer()
        if (!viewer) return

        if (isActive) {
            completedRef.current = false
            clearPlaneDistanceMeasurement(viewer)

            const validUnit: Unit = ['m', 'km', 'ft', 'mi'].includes(unit)
                ? (unit as Unit)
                : 'm'

            cleanupRef.current = startPlaneDistanceMeasurement(viewer, {
                unit: validUnit,
                onComplete: () => {
                    completedRef.current = true
                    dispatch(MeasurementAction.setInactive(undefined as void))
                },
                onCancel: () => {
                    dispatch(MeasurementAction.setInactive(undefined as void))
                },
            })
            return
        }

        if (cleanupRef.current && !completedRef.current) {
            cleanupRef.current()
        }
        cleanupRef.current = null
        completedRef.current = false
    }, [isActive, unit, dispatch])

    useEffect(() => {
        return () => {
            cleanupRef.current?.()
            cleanupRef.current = null
        }
    }, [])
}
