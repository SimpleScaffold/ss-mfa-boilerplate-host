/**
 * Remote module 타입 선언(공통)
 *
 * Remote 앱을 추가할 때마다 `remoteappX.d.ts`를 만들지 않도록,
 * Module Federation remote 모듈 경로를 와일드카드로 선언합니다.
 *
 * 규칙:
 * - modulePath: `remoteapp<*>/RemoteApp<*>`
 *
 * 더 엄격한 props 타입이 필요하면, 특정 remote에 대해서만 별도 declare module을 추가하세요.
 */
declare module 'remoteapp*/RemoteApp*' {
    import { ComponentType } from 'react'
    const RemoteApp: ComponentType<Record<string, unknown>>
    export default RemoteApp
}
