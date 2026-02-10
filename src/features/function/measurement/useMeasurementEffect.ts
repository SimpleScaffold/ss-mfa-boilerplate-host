import { useAppSelector } from 'src/globals/store/redux/reduxHooks'
import { selectMeasurementForEffect } from 'src/globals/store/redux/measurementSelectors'
import { usePlaneDistanceEffect } from './components/plane-distance/usePlaneDistanceEffect'

/**
 * Redux 측정 상태에 따라 각 측정 도구를 구동하는 훅.
 * MapViewer가 마운트된 페이지에서 사용해야 합니다.
 */
export function useMeasurementEffect() {
    const payload = useAppSelector(selectMeasurementForEffect)

    const isPlaneActive =
        payload.activeMeasurementType === 'plane' && payload.isActive

    usePlaneDistanceEffect({
        isActive: isPlaneActive,
        unit: payload.unit,
    })
}
