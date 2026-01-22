import type { Viewer } from 'cesium'
import type { CesiumViewerOptions } from './cesiumTypes'

/**
 * Cesium 설정 파일
 */

// Cesium base URL 설정
if (typeof window !== 'undefined') {
    ;(window as any).CESIUM_BASE_URL = CESIUM_BASE_URL
}

/**
 * Cesium 기본 설정
 */
export const cesiumConfig = {
    baseUrl: CESIUM_BASE_URL,
    defaultViewerOptions: {
        terrainProvider: undefined,
        animation: true,
        timeline: true,
        fullscreenButton: true,
        vrButton: false,
        geocoder: true,
        homeButton: true,
        infoBox: true,
        sceneModePicker: true,
        selectionIndicator: true,
        navigationHelpButton: true,
        navigationInstructionsInitiallyVisible: false,
    } satisfies Partial<CesiumViewerOptions>,
} as const
