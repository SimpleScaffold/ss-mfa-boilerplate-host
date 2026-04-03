/**
 * Module Federation 원격 모듈 타입.
 *
 * - 모달 페이지는 `measurement/*` 와일드카드로 기본 타입.
 * - 지도 브리지·Viewer 훅은 measurement가 소유; 호스트는 도메인 이름 없는 엔트리만 참조.
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

    export function useRemoteMapToolViewerEffects(
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
