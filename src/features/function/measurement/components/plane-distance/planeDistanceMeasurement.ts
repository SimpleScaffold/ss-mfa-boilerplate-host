import * as Cesium from 'cesium'
import type { Viewer } from 'cesium'
import { isValidViewer } from 'src/globals/cesium/cesiumUtils'
import { ENTITY_IDS, DEFAULTS } from './constants'
import {
    type Unit,
    formatDistance,
    getPositionFromScene,
    computeGeodesicDistance,
} from './utils'

export interface PlaneDistanceMeasurementOptions {
    unit?: Unit
    color?: Cesium.Color
    lineWidth?: number
    pointSize?: number
    onComplete?: (
        distanceMeters: number,
        start: Cesium.Cartesian3,
        end: Cesium.Cartesian3,
    ) => void
    onCancel?: () => void
}

/**
 * Cesium 평면 거리 측정을 시작합니다.
 * 사용자가 지도上 두 점을 클릭하면 측지선(평면) 거리를 계산하고 시각화합니다.
 *
 * @returns cleanup 함수 - 호출 시 이벤트 핸들러 해제 및 엔티티 제거
 */
export function startPlaneDistanceMeasurement(
    viewer: Viewer | null,
    options: PlaneDistanceMeasurementOptions = {},
): () => void {
    if (!isValidViewer(viewer)) {
        console.warn('[Measurement] Viewer가 유효하지 않습니다.')
        return () => {}
    }

    const {
        unit = 'm',
        color = Cesium.Color.CYAN,
        lineWidth = DEFAULTS.LINE_WIDTH,
        pointSize = DEFAULTS.POINT_SIZE,
        onComplete,
        onCancel,
    } = options

    const entities = viewer.entities
    const scene = viewer.scene
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)

    let startPosition: Cesium.Cartesian3 | undefined
    let polylineEntity: Cesium.Entity | null = null
    let labelEntity: Cesium.Entity | null = null
    let pointStartEntity: Cesium.Entity | null = null
    let pointEndEntity: Cesium.Entity | null = null
    let isFinished = false
    let cleanedUp = false

    function cleanup() {
        if (cleanedUp) return
        cleanedUp = true
        try {
            handler.destroy()
        } catch {
            // 이미 destroy된 경우 무시
        }
        if (polylineEntity) {
            entities.remove(polylineEntity)
            polylineEntity = null
        }
        if (labelEntity) {
            entities.remove(labelEntity)
            labelEntity = null
        }
        if (pointStartEntity) {
            entities.remove(pointStartEntity)
            pointStartEntity = null
        }
        if (pointEndEntity) {
            entities.remove(pointEndEntity)
            pointEndEntity = null
        }
        startPosition = undefined
        isFinished = true
    }

    function addPoint(position: Cesium.Cartesian3, id: string): Cesium.Entity {
        return entities.add({
            id,
            position,
            point: {
                pixelSize: pointSize,
                color,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            },
        })
    }

    handler.setInputAction(() => {
        if (!isFinished) {
            cleanup()
            onCancel?.()
        }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    handler.setInputAction(
        (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            if (isFinished) return

            const pos = getPositionFromScene(viewer, movement.position)
            if (!pos) return

            if (!startPosition) {
                startPosition = pos
                pointStartEntity = addPoint(pos, ENTITY_IDS.POINT_START)
                return
            }

            const endPosition = pos
            const distanceMeters = computeGeodesicDistance(
                startPosition,
                endPosition,
            )
            const { value, label } = formatDistance(distanceMeters, unit)
            const distanceText = `${value.toFixed(2)} ${label}`

            polylineEntity = entities.add({
                id: ENTITY_IDS.LINE,
                polyline: {
                    positions: [startPosition, endPosition],
                    width: lineWidth,
                    material: color,
                },
            })

            pointEndEntity = addPoint(endPosition, ENTITY_IDS.POINT_END)

            const midCarto = Cesium.Cartographic.fromCartesian(
                Cesium.Cartesian3.midpoint(
                    startPosition,
                    endPosition,
                    new Cesium.Cartesian3(),
                ),
            )
            const midPosition = Cesium.Cartesian3.fromRadians(
                midCarto.longitude,
                midCarto.latitude,
                (Cesium.Cartographic.fromCartesian(startPosition).height +
                    Cesium.Cartographic.fromCartesian(endPosition).height) /
                    2,
            )

            labelEntity = entities.add({
                id: ENTITY_IDS.LABEL,
                position: midPosition,
                label: {
                    text: distanceText,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                },
            })

            isFinished = true
            handler.destroy()

            onComplete?.(distanceMeters, startPosition, endPosition)
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return cleanup
}

/**
 * 평면 거리 측정 결과(선, 라벨, 점)를 제거합니다.
 */
export function clearPlaneDistanceMeasurement(viewer: Viewer | null): void {
    if (!isValidViewer(viewer)) return
    const entities = viewer.entities
    Object.values(ENTITY_IDS).forEach((id) => {
        const e = entities.getById(id)
        if (e) entities.remove(e)
    })
}
