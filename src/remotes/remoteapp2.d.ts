/**
 * Remote App 2 타입 선언
 *
 * Module Federation을 통해 로드되는 remoteapp2의 타입을 선언합니다.
 */
declare module 'remoteapp2/RemoteApp2' {
    import { ComponentType } from 'react'

    /**
     * Remote App 2 컴포넌트
     *
     * @example
     * ```tsx
     * import { lazy } from 'react'
     * const RemoteApp2 = lazy(() => import('remoteapp2/RemoteApp2'))
     * ```
     */
    const RemoteApp2: ComponentType<Record<string, unknown>>
    export default RemoteApp2
}
