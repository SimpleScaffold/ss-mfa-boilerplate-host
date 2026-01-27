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
        <div className="p-4">
            <h1 className="mb-4 text-2xl font-bold">Home</h1>

            <div className="mb-6">
                <MapControls className="mb-4" />
                <MapViewer height="600px" />
            </div>

            {remoteApp1 && (
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
            )}
        </div>
    )
}

export default Home
