import { Suspense, lazy, ComponentType, useMemo } from 'react'
import { RemoteAppConfig } from './config'

interface RemoteAppLoaderProps {
    /** 리모트 앱 설정 */
    config: RemoteAppConfig
    /** 로딩 중 표시할 컴포넌트 */
    fallback?: React.ReactNode
    /** 에러 발생 시 표시할 컴포넌트 */
    errorFallback?: React.ReactNode
    /** 리모트 앱에 전달할 props */
    props?: Record<string, unknown>
}

/**
 * 리모트 앱 모듈을 동적으로 로드하는 함수
 *
 * Module Federation은 빌드 타임에 모듈 경로를 인식해야 하므로,
 * 리모트 앱 ID에 따라 정적으로 import를 분기합니다.
 */
function loadRemoteModule(modulePath: string) {
    // 리모트 앱 ID에 따라 정적으로 import 분기
    // 이렇게 하면 빌드 타임에 Module Federation이 모듈을 인식할 수 있습니다
    if (modulePath === 'remoteapp1/RemoteApp1') {
        return import('remoteapp1/RemoteApp1')
    }
    if (modulePath === 'remoteapp2/RemoteApp2') {
        return import('remoteapp2/RemoteApp2')
    }

    // 알 수 없는 모듈 경로인 경우 에러
    return Promise.reject(
        new Error(`Unknown remote module path: ${modulePath}`),
    )
}

/**
 * 리모트 앱 동적 로더 컴포넌트
 *
 * Module Federation을 통해 리모트 앱을 동적으로 로드하고 렌더링합니다.
 */
export function RemoteAppLoader({
    config,
    fallback = <div>Loading {config.name}...</div>,
    errorFallback,
    props,
}: RemoteAppLoaderProps) {
    // useMemo를 사용하여 컴포넌트가 재생성되지 않도록 메모이제이션
    const RemoteComponent = useMemo(() => {
        return lazy(() => {
            return loadRemoteModule(config.modulePath).catch((error) => {
                console.error(`Failed to load remote app: ${config.id}`, error)
                if (errorFallback) {
                    // 에러 발생 시 에러 컴포넌트 반환
                    return {
                        default: () => errorFallback,
                    }
                }
                throw error
            })
        }) as ComponentType<Record<string, unknown>>
    }, [config.modulePath, config.id, errorFallback])

    return (
        <Suspense fallback={fallback}>
            <RemoteComponent {...props} />
        </Suspense>
    )
}
