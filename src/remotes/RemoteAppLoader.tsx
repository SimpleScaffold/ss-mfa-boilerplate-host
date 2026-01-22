import { Suspense, lazy, ComponentType } from 'react'
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
    // 동적으로 리모트 앱 모듈 로드
    const RemoteComponent = lazy(() => {
        return import(/* @vite-ignore */ config.modulePath).catch((error) => {
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

    return (
        <Suspense fallback={fallback}>
            <RemoteComponent {...props} />
        </Suspense>
    )
}
