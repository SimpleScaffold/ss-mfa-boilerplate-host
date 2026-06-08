/**
 * Module Federation 원격 모듈 타입.
 */
declare module 'remote/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}
