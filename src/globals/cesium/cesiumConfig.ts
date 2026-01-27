import * as Cesium from 'cesium'
import type { CesiumViewerOptions } from './cesiumTypes'

/**
 * Cesium 설정 파일
 *
 * baseUrl은 Redux state에서 관리됩니다.
 * cesiumReducer의 초기 state에서 설정됩니다.
 */

/**
 * Cesium 기본 Viewer 옵션
 */
export const cesiumConfig = {
    defaultViewerOptions: {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        geocoder: false,
        sceneModePicker: false,
        homeButton: false,
        navigationHelpButton: false,
        fullscreenButton: false,

        // 정적 리소스는 Redux state의 baseUrl에서 관리됨
        terrain: Cesium.Terrain.fromWorldTerrain(),
    } satisfies Partial<CesiumViewerOptions>,
} as const
