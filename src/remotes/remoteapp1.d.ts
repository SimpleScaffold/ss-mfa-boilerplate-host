/**
 * Remote App 1 타입 선언
 * 
 * Module Federation을 통해 로드되는 remoteapp1의 타입을 선언합니다.
 */
declare module 'remoteapp1/RemoteApp1' {
    import { ComponentType } from 'react'
    
    /**
     * Remote App 1 컴포넌트
     * 
     * @example
     * ```tsx
     * import { lazy } from 'react'
     * const RemoteApp1 = lazy(() => import('remoteapp1/RemoteApp1'))
     * ```
     */
    const RemoteApp1: ComponentType<Record<string, unknown>>
    export default RemoteApp1
}
