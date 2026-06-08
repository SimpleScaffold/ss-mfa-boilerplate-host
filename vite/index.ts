export {
    extractHostFromUrl,
    getPortFromUrl,
} from '../../../../../packages/fe/vite-config/url'
export { buildFederationRemotes, hostFederationShared } from './federationHost'
export { feUiResolvePlugin } from './plugins/feUiResolve'
export {
    mfVirtualRemotesPlugin,
    type MfVirtualRemotesOptions,
    type RemoteEntry,
} from './plugins/mfVirtualRemotes'
export {
    REMOTE_MAIN_EXPOSES,
    REMOTES_WITH_MODAL_EXPANSIONS,
    getModalExpansionModulePaths,
    getModalModulePathsFromMenu,
    getRemoteExposePathsFromMenu,
    type RemoteExposePaths,
} from './mfRemoteMenu'
