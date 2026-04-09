/**
 * Module Federation 원격 모듈 타입.
 *
 * - 모달 페이지는 `measurement/*` 와일드카드로 기본 타입.
 * - 지도 브리지·Viewer 훅은 measurement가 소유; 호스트는 도메인 이름 없는 엔트리만 참조.
 * - 호스트에서 소스로 풀 TS 리졸브가 필요하면 `apps/fe/tsconfig.host.json` paths 도 추가.
 * - `terrain-analysis/RemoteMapToolEffects`는 paths로 구현 + 아래 declare로 이름 있는 export 타입을 명시
 *   (`terrain-analysis/*` 와일드카드만 있으면 해당 패턴이 잡혀 named export 타입이 비어 이슈가 남).
 */
declare module 'measurement/MapToolBridge' {
    import type { ReactElement, ReactNode } from 'react'

    export type MapToolSession =
        | { active: false }
        | { active: true; toolId: string; options: unknown }

    export type MapToolBridgeApi = {
        setActive(toolId: string, options: unknown): void
        end: () => void
    }

    export function MapToolBridgeProvider(props: {
        children: ReactNode
    }): ReactElement

    export function useMapToolBridgeApi(): MapToolBridgeApi | null
    export function useMapToolSession(): MapToolSession
}

declare module 'measurement/RemoteMapToolEffects' {
    import type { MapToolSession } from 'measurement/MapToolBridge'
    import type { Viewer } from 'cesium'

    /** 호스트에서 `import * as Cesium from 'cesium'` 로 넘기는 값 */
    export type CesiumModule = typeof import('cesium')

    export function useRemoteMapToolViewerEffects(
        cesium: CesiumModule,
        viewer: Viewer | null | undefined,
        session: MapToolSession,
    ): void
}

declare module 'terrain-analysis/RemoteMapToolEffects' {
    import type { MapToolSession } from 'measurement/MapToolBridge'
    import type { Viewer } from 'cesium'

    export type CesiumModule = typeof import('cesium')

    export function useRemoteMapToolViewerEffects(
        cesium: CesiumModule,
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

declare module 'terrain-analysis/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}
