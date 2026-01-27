import { useEffect, useRef } from 'react'
import { Viewer } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { cesiumConfig } from '../cesiumConfig'
import { useAppDispatch, useAppSelector } from 'src/globals/store/redux/reduxHooks'
import { cesiumAction } from '../cesiumReducer'
import { cesiumViewerStore } from '../cesiumStore'
import type { CesiumViewerOptions } from '../cesiumTypes'

export interface MapViewerProps {
    className?: string
    height?: string
    options?: Partial<CesiumViewerOptions>
    onViewerReady?: (viewer: Viewer) => void
}

/**
 * Cesium Map Viewer 컴포넌트
 * 
 * Cesium 지도를 표시하는 메인 컴포넌트입니다.
 */
export const MapViewer = ({
    className = '',
    height = '600px',
    options,
    onViewerReady,
}: MapViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerRef = useRef<Viewer | null>(null)
    const dispatch = useAppDispatch()
    const { baseUrl, isInitialized, isLoading, error } = useAppSelector(
        (state) => state.cesiumReducer,
    )

    useEffect(() => {
        if (!containerRef.current) return

        // Cesium baseUrl 초기화 (Redux에서 가져온 값으로 window 설정)
        // Cesium 라이브러리가 window.CESIUM_BASE_URL을 읽기 때문
        if (typeof window !== 'undefined' && baseUrl) {
            window.CESIUM_BASE_URL = baseUrl
        }

        // 이미 Viewer가 초기화되어 있으면 재사용
        const existingViewer = cesiumViewerStore.getViewer()
        if (existingViewer && cesiumViewerStore.hasViewer()) {
            viewerRef.current = existingViewer
            if (onViewerReady) {
                onViewerReady(existingViewer)
            }
            return
        }

        // 새로운 Viewer 생성
        dispatch(cesiumAction.setLoading(true))
        dispatch(cesiumAction.setError(null))

        try {
            const viewer = new Viewer(containerRef.current, {
                ...cesiumConfig.defaultViewerOptions,
                ...options,
            })

            viewerRef.current = viewer
            cesiumViewerStore.setViewer(viewer)
            dispatch(cesiumAction.setInitialized(true))

            if (onViewerReady) {
                onViewerReady(viewer)
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Cesium Viewer 초기화 실패'
            dispatch(cesiumAction.setError(errorMessage))
            console.error('Cesium Viewer 초기화 오류:', err)
        } finally {
            dispatch(cesiumAction.setLoading(false))
        }

        // 정리 함수
        return () => {
            // 컴포넌트가 언마운트될 때 Viewer를 파괴하지 않음
            // (다른 컴포넌트에서 사용 중일 수 있음)
            // cesiumViewerStore에서 관리하도록 함
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={`relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">지도 로딩 중...</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 z-10">
                    <div className="text-center p-4">
                        <p className="text-red-600 text-sm font-semibold">오류 발생</p>
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                className="w-full rounded-lg overflow-hidden"
                style={{ height }}
            />
        </div>
    )
}

export default MapViewer
