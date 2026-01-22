import { useParams } from 'react-router'
import { RemoteAppLoader, RemoteAppErrorBoundary, findRemoteAppByRoute } from 'src/remotes'

/**
 * 리모트 앱 페이지 컴포넌트
 * 
 * URL 경로에 따라 해당하는 리모트 앱을 동적으로 로드하여 렌더링합니다.
 * 
 * 사용 예시:
 * - /remote-app-1 -> remoteapp1 렌더링
 * - /remote-app-2 -> remoteapp2 렌더링
 */
const RemoteAppPage = () => {
    const { '*': routePath } = useParams<{ '*': string }>()
    const fullPath = routePath ? `/${routePath}` : '/'

    // 라우트 경로로 리모트 앱 설정 찾기
    const remoteApp = findRemoteAppByRoute(fullPath)

    if (!remoteApp) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">리모트 앱을 찾을 수 없습니다</h2>
                <p className="text-gray-600">
                    경로 <code className="bg-gray-100 px-2 py-1 rounded">{fullPath}</code>에
                    해당하는 리모트 앱이 설정되지 않았습니다.
                </p>
            </div>
        )
    }

    return (
        <RemoteAppErrorBoundary
            config={remoteApp}
            fallback={(error) => (
                <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        {remoteApp.name} 로딩 실패
                    </h3>
                    <p className="text-red-600 text-sm">{error.message}</p>
                </div>
            )}
        >
            <RemoteAppLoader
                config={remoteApp}
                fallback={
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                            <p className="text-gray-600">{remoteApp.name} 로딩 중...</p>
                        </div>
                    </div>
                }
            />
        </RemoteAppErrorBoundary>
    )
}

export default RemoteAppPage
