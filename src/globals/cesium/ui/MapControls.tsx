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
        <div className={`flex gap-2 flex-wrap ${className}`}>
            <button
                onClick={handleFlyToSeoul}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                서울로 이동
            </button>
            <button
                onClick={handleFlyToTokyo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                도쿄로 이동
            </button>
            <button
                onClick={handleFlyToNewYork}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                뉴욕으로 이동
            </button>
            <button
                onClick={handleResetView}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
                전체 보기
            </button>
        </div>
    )
}

export default MapControls
