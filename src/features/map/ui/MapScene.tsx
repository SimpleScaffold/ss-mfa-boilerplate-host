import { Suspense, lazy } from 'react'
import { useViewerEffects } from '../model/useViewerEffects'

const LazyMapViewer = lazy(async () => {
    const mod = await import('src/globals/cesium/ui/MapViewer')
    return { default: mod.MapViewer }
})

export interface MapSceneProps {
    className?: string
}

/**
 * 지도 + Viewer Effect(측정, 분석 등)가 결합된 Map Scene.
 * MapViewer가 마운트되는 페이지에서 이 컴포넌트를 사용하면
 * 모든 effect가 자동으로 등록됩니다.
 */
export const MapScene = ({ className = '' }: MapSceneProps) => {
    useViewerEffects()

    return (
        <div
            className={`flex h-full w-full flex-col overflow-hidden ${className}`}
        >
            <Suspense
                fallback={<div className="p-4">지도를 불러오는 중...</div>}
            >
                <LazyMapViewer />
            </Suspense>
        </div>
    )
}
