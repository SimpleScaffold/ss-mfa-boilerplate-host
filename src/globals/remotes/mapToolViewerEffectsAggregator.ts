import type { MapToolSession } from 'src/globals/mfModalProtocol'
import type { Viewer } from 'cesium'
import { useMeasurementMapToolViewerEffects } from 'measurement/PlanarDistanceMapTool'

/**
 * 리모트(마이크로앱)별 지도 Viewer 훅을 한곳에만 모은다.
 * 새 원격 앱이 Cesium에 도구를 붙이면 **이 파일에 훅 호출 한 줄**만 추가하면 되고,
 * `useViewerEffects.ts`·`MenuLayout.tsx`·`remote-modules.d.ts`는 건드리지 않는 것을 목표로 한다.
 * (해당 리모트의 `declare module '…'` 타입만 `remote-modules.d.ts`에 블록 추가)
 */
export function useAllRemoteMapToolViewerEffects(
    viewer: Viewer | null | undefined,
    session: MapToolSession,
): void {
    useMeasurementMapToolViewerEffects(viewer, session)
}
