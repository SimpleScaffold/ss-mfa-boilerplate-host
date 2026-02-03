/**
 * ⚠ AUTO-GENERATED FILE
 *
 * 생성 소스: config/env/*.ts (예: local.ts)
 * 생성 시점: 2026-02-03T04:27:41.270Z
 *
 * 이 파일을 직접 수정하지 마세요. (다음 `yarn dev` 시 덮어써집니다)
 */

/* eslint-disable */

export type RemoteAppConfig = {
    id: string
    name: string
    routePath: string
    modulePath: string
    fullPage?: boolean
    layoutSlot?: 'main' | 'sidebar' | 'header' | 'footer'
    enabled?: boolean
}

export const REMOTE_APPS: RemoteAppConfig[] = [
    {
        id: 'remoteapp1',
        name: 'Remote App 1',
        routePath: '/remote-app-1',
        modulePath: 'remoteapp1/RemoteApp1',
        fullPage: true,
        enabled: true,
    },
]
