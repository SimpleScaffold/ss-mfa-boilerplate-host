/**
 * 리모트 앱 관련 유틸리티 및 컴포넌트 export
 */

export {
    REMOTE_APPS,
    getEnabledRemoteApps,
    findRemoteAppById,
} from './config'
export type { RemoteAppConfig } from './config'
export { RemoteAppLoader } from './RemoteAppLoader'
export { RemoteAppErrorBoundary } from './RemoteAppErrorBoundary'
