import { useCallback } from 'react'
import { cesiumViewerStore } from '../cesiumStore'
import { flyTo, setView } from '../cesiumUtils'

export interface MapControlsProps {
    className?: string
}

/**
 * Cesium Map Controls 컴포넌트
 *
 * 지도 제어 버튼들을 제공합니다.
 */
export const MapControls = ({ className = '' }: MapControlsProps) => {
    const handleFlyToSeoul = useCallback(() => {
        const viewer = cesiumViewerStore.getViewer()
        flyTo(viewer, 126.978, 37.5665, 10000, 2.0)
    }, [])

    const handleFlyToTokyo = useCallback(() => {
        const viewer = cesiumViewerStore.getViewer()
        flyTo(viewer, 139.6917, 35.6895, 10000, 2.0)
    }, [])

    const handleFlyToNewYork = useCallback(() => {
        const viewer = cesiumViewerStore.getViewer()
        flyTo(viewer, -74.006, 40.7128, 10000, 2.0)
    }, [])

    const handleResetView = useCallback(() => {
        const viewer = cesiumViewerStore.getViewer()
        setView(viewer, 0, 0, 20000000) // 지구 전체 보기
    }, [])

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            <button
                onClick={handleFlyToSeoul}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
                서울로 이동
            </button>
            <button
                onClick={handleFlyToTokyo}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
                도쿄로 이동
            </button>
            <button
                onClick={handleFlyToNewYork}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
                뉴욕으로 이동
            </button>
            <button
                onClick={handleResetView}
                className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            >
                전체 보기
            </button>
        </div>
    )
}

export default MapControls
