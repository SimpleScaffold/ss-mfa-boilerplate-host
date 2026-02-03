import { useParams } from 'react-router'
import {
    RemoteAppLoader,
    RemoteAppErrorBoundary,
    findRemoteAppById,
} from 'src/remotes'

/**
 * 리모트 앱 페이지 컴포넌트
 *
 * URL 경로에 따라 해당하는 리모트 앱을 동적으로 로드하여 렌더링합니다.
 *
 * 사용 예시:
 * - /_mfe/remoteapp1 -> remoteapp1 렌더링
 * - /_mfe/remoteapp2 -> remoteapp2 렌더링
 */
const RemoteAppPage = () => {
    const { id } = useParams()

    // id로 리모트 앱 설정 찾기
    const remoteApp = id ? findRemoteAppById(id) : undefined

    if (!remoteApp) {
        return (
            <div className="p-4">
                <h2 className="mb-2 text-xl font-semibold">
                    리모트 앱을 찾을 수 없습니다
                </h2>
                <p className="text-gray-600">
                    리모트 ID{' '}
                    <code className="rounded bg-gray-100 px-2 py-1">
                        {id || '(없음)'}
                    </code>
                    에 해당하는 리모트 앱이 설정되지 않았습니다.
                </p>
            </div>
        )
    }

    return (
        <RemoteAppErrorBoundary
            config={remoteApp}
            fallback={(error) => (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                    <h3 className="mb-2 text-lg font-semibold text-red-800">
                        {remoteApp.name} 로딩 실패
                    </h3>
                    <p className="text-sm text-red-600">{error.message}</p>
                </div>
            )}
        >
            <RemoteAppLoader
                config={remoteApp}
                fallback={
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
                            <p className="text-gray-600">
                                {remoteApp.name} 로딩 중...
                            </p>
                        </div>
                    </div>
                }
            />
        </RemoteAppErrorBoundary>
    )
}

export default RemoteAppPage
