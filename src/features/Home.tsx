import {
    RemoteAppLoader,
    RemoteAppErrorBoundary,
    findRemoteAppById,
} from 'src/remotes'
import { MapViewer } from 'src/globals/cesium/ui/MapViewer'
import { MapControls } from 'src/globals/cesium/ui/MapControls'

const Home = () => {
    // 리모트 앱 설정 가져오기
    const remoteApp1 = findRemoteAppById('remoteapp1')

    return (
        <div className="flex h-full w-full bg-blue-500">
            <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                <MapViewer />
            </div>

            {/* <MapControls className="mb-4" /> */}

            {/* {remoteApp1 && (
                <div className="mt-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        {remoteApp1.name}
                    </h2>
                    <RemoteAppErrorBoundary config={remoteApp1}>
                        <RemoteAppLoader
                            config={remoteApp1}
                            fallback={
                                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200">
                                    <div className="text-center">
                                        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                        <p className="text-sm text-gray-600">
                                            {remoteApp1.name} 로딩 중...
                                        </p>
                                    </div>
                                </div>
                            }
                        />
                    </RemoteAppErrorBoundary>
                </div>
            )} */}
        </div>
    )
}

export default Home
