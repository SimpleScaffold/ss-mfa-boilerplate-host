import type { Viewer } from 'cesium'

/**
 * Cesium Viewer 인스턴스 타입
 */
export type CesiumViewer = Viewer

/**
 * Cesium Viewer 초기화 옵션 타입
 * Viewer 생성자의 두 번째 파라미터 타입
 */
export type CesiumViewerOptions = ConstructorParameters<typeof Viewer>[1] extends undefined
    ? Record<string, never>
    : NonNullable<ConstructorParameters<typeof Viewer>[1]>

/**
 * Cesium 상태 타입
 */
export interface CesiumState {
    viewer: CesiumViewer | null
    isInitialized: boolean
    isLoading: boolean
    error: string | null
}

/**
 * Cesium 초기화 파라미터
 */
export interface InitializeCesiumParams {
    container: HTMLElement
    options?: Partial<CesiumViewerOptions>
}
