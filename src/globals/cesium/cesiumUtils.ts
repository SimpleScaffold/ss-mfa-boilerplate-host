import type { Viewer } from 'cesium'
import * as Cesium from 'cesium'
import type { CesiumViewer } from './cesiumTypes'

/**
 * Cesium 유틸리티 함수들
 */

/**
 * Viewer가 유효한지 확인
 */
export function isValidViewer(viewer: CesiumViewer | null): viewer is Viewer {
    return viewer !== null && !viewer.isDestroyed()
}

/**
 * Viewer를 안전하게 파괴
 */
export function safeDestroyViewer(viewer: CesiumViewer | null): void {
    if (isValidViewer(viewer)) {
        try {
            viewer.destroy()
        } catch (error) {
            console.warn('Cesium Viewer 파괴 중 오류 발생:', error)
        }
    }
}

/**
 * Viewer의 카메라를 특정 위치로 이동
 */
export function flyTo(
    viewer: CesiumViewer | null,
    longitude: number,
    latitude: number,
    height: number = 10000,
    duration: number = 2.0,
): void {
    if (!isValidViewer(viewer)) {
        console.warn('유효한 Viewer 인스턴스가 없습니다.')
        return
    }

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        duration,
    })
}

/**
 * Viewer의 카메라를 특정 위치로 즉시 이동
 */
export function setView(
    viewer: CesiumViewer | null,
    longitude: number,
    latitude: number,
    height: number = 10000,
): void {
    if (!isValidViewer(viewer)) {
        console.warn('유효한 Viewer 인스턴스가 없습니다.')
        return
    }

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    })
}

/**
 * Viewer에 엔티티 추가
 */
export function addEntity(
    viewer: CesiumViewer | null,
    id: string,
    options: {
        position?: { longitude: number; latitude: number; height?: number }
        point?: { pixelSize?: number; color?: string }
        label?: { text: string; font?: string; fillColor?: string }
        [key: string]: unknown
    },
): void {
    if (!isValidViewer(viewer)) {
        console.warn('유효한 Viewer 인스턴스가 없습니다.')
        return
    }

    const entityOptions: Record<string, unknown> = { id }

    if (options.position) {
        entityOptions.position = Cesium.Cartesian3.fromDegrees(
            options.position.longitude,
            options.position.latitude,
            options.position.height || 0,
        )
    }

    if (options.point) {
        entityOptions.point = {
            pixelSize: options.point.pixelSize || 10,
            color: options.point.color || Cesium.Color.YELLOW,
        }
    }

    if (options.label) {
        entityOptions.label = {
            text: options.label.text,
            font: options.label.font || '14px sans-serif',
            fillColor: options.label.fillColor
                ? Cesium.Color.fromCssColorString(options.label.fillColor)
                : Cesium.Color.WHITE,
        }
    }

    viewer.entities.add(entityOptions)
}

/**
 * Viewer에서 엔티티 제거
 */
export function removeEntity(viewer: CesiumViewer | null, id: string): void {
    if (!isValidViewer(viewer)) {
        return
    }

    viewer.entities.removeById(id)
}

/**
 * Viewer의 모든 엔티티 제거
 */
export function removeAllEntities(viewer: CesiumViewer | null): void {
    if (!isValidViewer(viewer)) {
        return
    }

    viewer.entities.removeAll()
}
