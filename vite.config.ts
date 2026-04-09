import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, type UserConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import {
    ENV_MODE,
    getHostConfig,
    getRemoteConfigs,
    type EnvMode,
    type RemoteConfig,
} from '../../../../config'
import {
    buildFederationRemotes,
    cesiumBaseUrl,
    cesiumStaticPlugin,
    extractHostFromUrl,
    feUiResolvePlugin,
    getCesiumSource,
    getModalExpansionModulePaths,
    getModalModulePathsFromMenu,
    getPortFromUrl,
    getRemoteExposePathsFromMenu,
    hostFederationShared,
    mfVirtualRemotesPlugin,
    REMOTE_MAIN_EXPOSES,
} from './vite'
import { devServerProxy } from './vite/proxy'
import { MOCK_MENU_DATA } from './src/features/menu/data/menuMockData'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')
const hostSrc = path.resolve(__dirname, 'src')
const uiSrc = path.join(repoRoot, 'packages/fe/ui/src')

export default defineConfig(async (): Promise<UserConfig> => {
    const envMode = (process.env.MF_ENV || ENV_MODE.LOCAL) as EnvMode
    const hostConfig = await getHostConfig(envMode)
    if (!hostConfig?.url) {
        throw new Error(
            'Host 설정을 config/env (예: local.ts)에 추가해주세요. (hosts[].url)',
        )
    }

    const baseUrl = hostConfig.url
    const port =
        'port' in hostConfig && typeof hostConfig.port === 'number'
            ? hostConfig.port
            : getPortFromUrl(baseUrl)
    const host = extractHostFromUrl(baseUrl)

    const remoteConfigs: RemoteConfig[] = await getRemoteConfigs(envMode)
    const remoteNames = new Set(
        remoteConfigs.map((r) => r.name).filter((n): n is string => Boolean(n)),
    )
    const remoteExposePaths = getRemoteExposePathsFromMenu(
        MOCK_MENU_DATA,
        remoteNames,
        REMOTE_MAIN_EXPOSES,
    )
    const modalModulePaths = getModalModulePathsFromMenu(
        MOCK_MENU_DATA,
        remoteNames,
    )
    const modalExpansionModulePaths = getModalExpansionModulePaths(remoteNames)
    const remotes = buildFederationRemotes(remoteConfigs, remoteExposePaths)

    return {
        plugins: [
            tsconfigPaths({
                projects: [path.join(__dirname, 'tsconfig.json')],
            }),
            feUiResolvePlugin(),
            mfVirtualRemotesPlugin({
                remoteExposePaths,
                remotes: remoteConfigs,
                modalModulePaths,
                modalExpansionModulePaths,
            }),
            react(),
            tailwindcss(),
            cesiumStaticPlugin(repoRoot),
            viteStaticCopy({
                targets: [
                    {
                        src: path.join(getCesiumSource(repoRoot), '**/*'),
                        dest: cesiumBaseUrl,
                    },
                ],
            }),
            federation({
                name: 'host',
                remotes,
                shared: hostFederationShared,
                dts: false,
            }),
        ],
        define: {
            CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        },
        resolve: {
            alias: [
                { find: 'config', replacement: path.join(repoRoot, 'config') },
                { find: /^@\//, replacement: `${uiSrc}/` },
                { find: /^src\//, replacement: `${hostSrc}/` },
                {
                    find: /^@assets\//,
                    replacement: `${path.join(uiSrc, 'assets')}/`,
                },
            ],
            preserveSymlinks: false,
        },
        server: {
            origin: baseUrl,
            port,
            open: false,
            cors: true,
            hmr: { port, host },
            fs: { allow: [repoRoot] },
            proxy: devServerProxy,
        },
        preview: {
            host,
            port,
            strictPort: true,
            open: false,
            cors: true,
            proxy: devServerProxy,
        },
        build: {
            target: 'chrome107',
            rollupOptions: {
                output: {
                    format: 'es',
                    generatedCode: {
                        constBindings: true,
                        objectShorthand: true,
                    },
                },
            },
            commonjsOptions: { transformMixedEsModules: true },
            minify: 'esbuild',
            sourcemap: false,
        },
    } as UserConfig
})
