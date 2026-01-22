import { RemoteAppLoader, RemoteAppErrorBoundary, findRemoteAppById } from 'src/remotes'
import { MapViewer } from 'src/globals/cesium/ui/MapViewer'
import { MapControls } from 'src/globals/cesium/ui/MapControls'

const Home = () => {
    // 리모트 앱 설정 가져오기
    const remoteApp1 = findRemoteAppById('remoteapp1')

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Home</h1>
            
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Cesium 지도</h2>
                <MapControls className="mb-4" />
                <MapViewer height="600px" />
            </div>

            {remoteApp1 && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">{remoteApp1.name}</h2>
                    <RemoteAppErrorBoundary config={remoteApp1}>
                        <RemoteAppLoader
                            config={remoteApp1}
                            fallback={
                                <div className="flex items-center justify-center min-h-[200px] border border-gray-200 rounded-lg">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                                        <p className="text-gray-600 text-sm">{remoteApp1.name} 로딩 중...</p>
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
