import {
    Suspense,
    lazy,
    ComponentType,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { RemoteAppConfig } from './config'
import { loadRemoteModule } from './generated-remote-imports'

/**
 * 첫 로드 시 MF 런타임/원격 청크 준비(특히 Vite optimizeDeps) 지연으로
 * 동적 import가 실패할 수 있습니다.
 *
 * - 내부 재시도: 같은 lazy import Promise 내부에서 빠르게 재시도
 * - 외부 재시도: lazy 자체를 "재생성"해서(= React.lazy 실패 캐시 회피) 다시 import
 */
const REMOTE_LOAD_MAX_RETRIES = 3
const REMOTE_LOAD_RETRY_DELAY_MS = 500
const OUTER_REMOTE_LOAD_MAX_RETRIES = 20
const OUTER_REMOTE_LOAD_RETRY_DELAY_MS = 1000

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    try {
        return JSON.stringify(error)
    } catch {
        return '알 수 없는 오류가 발생했습니다.'
    }
}

function loadRemoteModuleWithRetry(
    modulePath: string,
): Promise<{ default: ComponentType<Record<string, unknown>> }> {
    let lastError: unknown
    const attempt = (
        attemptNum: number,
    ): Promise<{ default: ComponentType<Record<string, unknown>> }> => {
        return loadRemoteModule(modulePath).catch((err: unknown) => {
            lastError = err
            if (attemptNum >= REMOTE_LOAD_MAX_RETRIES)
                return Promise.reject(lastError)
            return new Promise<void>((r) =>
                setTimeout(r, REMOTE_LOAD_RETRY_DELAY_MS),
            ).then(() => attempt(attemptNum + 1))
        })
    }
    return attempt(0)
}

function AutoRetryFallback({
    remoteName,
    attempt,
    maxAttempts,
    delayMs,
    error,
    onRetry,
    errorFallback,
}: {
    remoteName: string
    attempt: number
    maxAttempts: number
    delayMs: number
    error: unknown
    onRetry: () => void
    errorFallback?: React.ReactNode
}) {
    const isExhausted = attempt >= maxAttempts

    useEffect(() => {
        if (isExhausted) return
        const t = window.setTimeout(onRetry, delayMs)
        return () => window.clearTimeout(t)
    }, [delayMs, isExhausted, onRetry])

    if (isExhausted) {
        if (errorFallback) return errorFallback
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <h3 className="mb-2 text-lg font-semibold text-red-800">
                    {remoteName} 로딩 실패
                </h3>
                <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-gray-900"></div>
                <p className="text-sm text-gray-600">
                    {remoteName} 로딩 재시도 중... ({attempt + 1}/{maxAttempts})
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    {getErrorMessage(error)}
                </p>
            </div>
        </div>
    )
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
    const [outerAttempt, setOuterAttempt] = useState(0)
    const unmountedRef = useRef(false)

    useEffect(() => {
        unmountedRef.current = false
        return () => {
            unmountedRef.current = true
        }
    }, [])

    // config가 바뀌면(라우트 이동 등) 외부 재시도 카운터를 초기화
    useEffect(() => {
        setOuterAttempt(0)
    }, [config.id, config.modulePath])

    const bumpOuterAttempt = useCallback(() => {
        if (unmountedRef.current) return
        setOuterAttempt((a) => a + 1)
    }, [])

    // React.lazy는 "실패한 Promise"를 캐시하므로,
    // 일시적인 네트워크/remote 준비 지연으로 실패했을 때는 lazy를 재생성(= remount)해야 복구됩니다.
    const RemoteComponent = useMemo(() => {
        return lazy(async () => {
            try {
                return await loadRemoteModuleWithRetry(config.modulePath)
            } catch (error) {
                console.warn(
                    `Remote load failed (${config.id}). Will retry by remounting lazy()`,
                    error,
                )
                return {
                    default: () => (
                        <AutoRetryFallback
                            remoteName={config.name}
                            attempt={outerAttempt}
                            maxAttempts={OUTER_REMOTE_LOAD_MAX_RETRIES}
                            delayMs={OUTER_REMOTE_LOAD_RETRY_DELAY_MS}
                            error={error}
                            onRetry={bumpOuterAttempt}
                            errorFallback={errorFallback}
                        />
                    ),
                }
            }
        }) as ComponentType<Record<string, unknown>>
    }, [
        bumpOuterAttempt,
        config.id,
        config.modulePath,
        config.name,
        errorFallback,
        outerAttempt,
    ])

    return (
        <Suspense fallback={fallback}>
            <RemoteComponent {...props} />
        </Suspense>
    )
}
