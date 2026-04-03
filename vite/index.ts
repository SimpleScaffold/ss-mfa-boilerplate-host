export {
    extractHostFromUrl,
    getPortFromUrl,
} from '../../../../../packages/fe/vite-config/url'
export { buildFederationRemotes, hostFederationShared } from './federationHost'
export {
    cesiumBaseUrl,
    cesiumStaticPlugin,
    getCesiumSource,
} from './plugins/cesium'
export { feUiResolvePlugin } from './plugins/feUiResolve'
export {
    mfVirtualRemotesPlugin,
    type MfVirtualRemotesOptions,
    type RemoteEntry,
    type RemoteExposePaths,
} from './plugins/mfVirtualRemotes'
