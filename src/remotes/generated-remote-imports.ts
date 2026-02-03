/**
 * ⚠ AUTO-GENERATED FILE
 *
 * 생성 소스: config/env/*.ts (예: local.ts)
 * 생성 시점: ${new Date().toISOString()}
 *
 * 이 파일을 직접 수정하지 마세요. (다음 `yarn dev` 시 덮어써집니다)
 */

export function loadRemoteModule(modulePath: string) {
    switch (modulePath) {
        case 'remoteapp1/RemoteApp1':
            return import('remoteapp1/RemoteApp1')
        default:
            return Promise.reject(
                new Error(`Unknown remote module path: ${modulePath}`),
            )
    }
}
