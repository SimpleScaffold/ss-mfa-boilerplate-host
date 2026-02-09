import { MapViewer } from 'src/globals/cesium/ui/MapViewer'

const Home = () => {
    return (
        <div className="flex h-full w-full bg-blue-500">
            <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <MapViewer />
            </div>

            {/* <MapControls className="mb-4" /> */}

            {/* 마이크로앱은 메뉴 클릭 시 직접 렌더링하거나 다른 방식으로 관리 */}
        </div>
    )
}

export default Home
