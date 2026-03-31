/**
 * Remote module 타입 선언(공통)
 *
 * @originjs/vite-plugin-federation: remote expose 경로에 대한 타입 선언.
 * config remotes의 name으로 import (예: measurement/PlanarDistance).
 */
declare module 'measurement/PlanarDistanceMapTool' {
    import type { PlanarDistanceToolOptions } from '@repo/mf-modal-protocol'
    import type { Cartesian2, Cartesian3, Viewer } from 'cesium'

    export const IDLE_PLANAR_OPTIONS: PlanarDistanceToolOptions
    export function usePlanarDistanceTool(
        viewer: Viewer | null | undefined,
        enabled: boolean,
        options: PlanarDistanceToolOptions,
    ): void
    export function pickCartesianOnGlobe(
        viewer: Viewer,
        screenPosition: Cartesian2,
    ): Cartesian3 | undefined
    export function geodesicSurfaceDistanceMeters(
        fromCartesian: Cartesian3,
        toCartesian: Cartesian3,
    ): number
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
