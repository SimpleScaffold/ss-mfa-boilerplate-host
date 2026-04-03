/**
 * Module Federation 원격 모듈 타입.
 *
 * - 모달 페이지용 `measurement/*` 등은 아래 와일드카드로 기본 타입만 제공.
 * - 지도 Viewer 훅을 호스트에서 import하는 모듈은 **집계기**(`mapToolViewerEffectsAggregator`)에서만 쓰므로,
 *   새 리모트를 붙일 때는 여기에 `declare module '원격이름/Expose경로'` 블록을 **한 번** 추가한다.
 */
declare module 'measurement/MapToolBridge' {
    import type { ReactElement, ReactNode } from 'react'

    export const MAP_TOOL_ID: {
        readonly PLANAR_DISTANCE: 'planar-distance'
    }

    export type MapToolId = (typeof MAP_TOOL_ID)[keyof typeof MAP_TOOL_ID]

    export type PlanarMeasureMode = 'continuous' | 'multi'

    export interface PlanarDistanceToolOptions {
        mode: PlanarMeasureMode
        keepPreviousOnNewMeasure: boolean
        lineColor: string
        labelColor: string
        markerColor: string
        segmentLabel: string
        lineWidthPx: number
        labelFontSizePx: number
    }

    export type MapToolSession =
        | { active: false }
        | {
              active: true
              toolId: typeof MAP_TOOL_ID.PLANAR_DISTANCE
              options: PlanarDistanceToolOptions
          }

    export type MapToolBridgeApi = {
        setActive(
            toolId: typeof MAP_TOOL_ID.PLANAR_DISTANCE,
            options: PlanarDistanceToolOptions,
        ): void
        end: () => void
    }

    export function MapToolBridgeProvider(props: {
        children: ReactNode
    }): ReactElement

    export function useMapToolBridgeApi(): MapToolBridgeApi | null
    export function useMapToolSession(): MapToolSession
}

declare module 'measurement/PlanarDistanceMapTool' {
    import type { MapToolSession } from 'measurement/MapToolBridge'
    import type { Viewer } from 'cesium'

    export function useMeasurementMapToolViewerEffects(
        viewer: Viewer | null | undefined,
        session: MapToolSession,
    ): void
}

declare module 'measurement/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}

declare module 'remote/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}
