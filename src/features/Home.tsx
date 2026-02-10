import { Suspense, lazy } from 'react'

const LazyMapViewer = lazy(async () => {
    const mod = await import('src/globals/cesium/ui/MapViewer')
    return { default: mod.MapViewer }
})

const Home = () => {
    return (
        <div className="flex h-full w-full bg-blue-500">
            <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <Suspense
                    fallback={<div className="p-4">지도를 불러오는 중...</div>}
                >
                    <LazyMapViewer />
                </Suspense>
            </div>

            {/* <MapControls className="mb-4" /> */}

            {/* 마이크로앱은 메뉴 클릭 시 직접 렌더링하거나 다른 방식으로 관리 */}
        </div>
    )
}

export default Home
