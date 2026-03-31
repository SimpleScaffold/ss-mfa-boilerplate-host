/**
 * 리모트 앱 설정 관리
 *
 * 각 리모트 앱의 메타데이터와 라우트 매핑을 중앙에서 관리합니다.
 * config/env/*.ts의 remotes 설정을 기반으로, Vite 가상 모듈에서 제공되는 값을 사용합니다.
 */

import { REMOTE_APPS as VIRTUAL_REMOTE_APPS } from 'virtual:mf-remotes-config'

export type RemoteAppConfig = {
    /** 리모트 앱 식별자 (vite.config.ts의 remotes 키와 일치) */
    id: string
    /** 리모트 앱 표시 이름 */
    name: string
    /** 리모트 앱 모듈 경로 (예: 'remoteapp1/RemoteApp1') */
    modulePath: string
    /** 리모트 앱이 전체 페이지를 차지하는지 여부 */
    fullPage?: boolean
    /** 리모트 앱이 특정 레이아웃 영역에 렌더링되는지 여부 */
    layoutSlot?: 'main' | 'sidebar' | 'header' | 'footer'
    /** 리모트 앱 활성화 여부 */
    enabled?: boolean
}

/**
 * 리모트 앱 설정 목록
 *
 * config/env/*.ts의 설정을 기반으로 동적으로 제공됩니다.
 * 새로운 리모트 앱을 추가하려면 해당 env 파일의 remotes 배열에 추가하세요.
 */
export const REMOTE_APPS = VIRTUAL_REMOTE_APPS as RemoteAppConfig[]

/**
 * 활성화된 리모트 앱만 필터링
 */
export const getEnabledRemoteApps = (): RemoteAppConfig[] => {
    return REMOTE_APPS.filter((app) => app.enabled !== false)
}

/**
 * 리모트 앱 ID로 설정 찾기
 */
export const findRemoteAppById = (id: string): RemoteAppConfig | undefined => {
    return REMOTE_APPS.find((app) => app.id === id)
}
