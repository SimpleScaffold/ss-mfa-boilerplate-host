import { Suspense, lazy, ComponentType, useMemo } from 'react'
import { RemoteAppConfig } from './config'
import { loadRemoteModule } from './generated-remote-imports'

/** 첫 로드 시 MF 런타임/원격 청크 준비 지연으로 실패할 수 있어, 재시도로 복구 */
const REMOTE_LOAD_MAX_RETRIES = 3
const REMOTE_LOAD_RETRY_DELAY_MS = 500

function loadRemoteModuleWithRetry(modulePath: string): Promise<{ default: ComponentType<Record<string, unknown>> }> {
    let lastError: unknown
    const attempt = (attemptNum: number): Promise<{ default: ComponentType<Record<string, unknown>> }> => {
        return loadRemoteModule(modulePath).catch((err: unknown) => {
            lastError = err
            if (attemptNum >= REMOTE_LOAD_MAX_RETRIES) return Promise.reject(lastError)
            return new Promise<void>((r) => setTimeout(r, REMOTE_LOAD_RETRY_DELAY_MS)).then(
                () => attempt(attemptNum + 1),
            )
        })
    }
    return attempt(0)
}

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
 * 첫 로드 실패 시 자동으로 몇 회 재시도하여 MF 준비 지연을 흡수합니다.
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
            return loadRemoteModuleWithRetry(config.modulePath).catch((error) => {
                console.error(`Failed to load remote app: ${config.id}`, error)
                if (errorFallback) {
                    return { default: () => errorFallback }
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
