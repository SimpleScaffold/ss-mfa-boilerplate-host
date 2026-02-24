/**
 * Remote module 타입 선언(공통)
 *
 * @originjs/vite-plugin-federation: remote expose 경로에 대한 타입 선언.
 * config remotes의 name으로 import (예: measurement/PlanarDistance).
 */
declare module 'measurement/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}

declare module 'remote/*' {
    import { ComponentType } from 'react'
    const C: ComponentType<Record<string, unknown>>
    export default C
}
