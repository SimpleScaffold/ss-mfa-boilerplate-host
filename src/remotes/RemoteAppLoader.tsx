import { Suspense, lazy, ComponentType, useMemo } from 'react'
import { RemoteAppConfig } from './config'
import { loadRemoteModule } from './generated-remote-imports'

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

// NOTE:
// Module Federation은 빌드 타임에 모듈 경로를 인식해야 하므로,
// 실제 import 분기(정적 import)는 `generated-remote-imports.ts`에서 자동 생성합니다.

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
