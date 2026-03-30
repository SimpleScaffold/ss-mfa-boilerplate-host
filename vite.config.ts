import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { defineConfig, type UserConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    getHostConfig,
    getRemoteConfigs,
    getModalModulePathsFromMenu,
    getModalExpansionModulePaths,
    getRemoteExposePathsFromMenu,
    REMOTE_MAIN_EXPOSES,
    ENV_MODE,
    type EnvMode,
} from '../../../../config'
import {
    extractHostFromUrl,
    getPortFromUrl,
    cesiumStaticPlugin,
    cesiumBaseUrl,
    getCesiumSource,
    feUiResolvePlugin,
    mfVirtualRemotesPlugin,
    type RemoteEntry,
} from '../../../../config/vite'
import { MOCK_MENU_DATA } from './src/features/menu/data/menuMockData'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

export default defineConfig(async ({ command }): Promise<UserConfig> => {
    const envMode = (process.env.MF_ENV || ENV_MODE.LOCAL) as EnvMode
    const hostConfig = await getHostConfig(envMode)
    if (!hostConfig?.url) {
        throw new Error(
            'Host 설정을 config/env (예: local.ts)에 추가해주세요. (hosts[].url)',
        )
    }
    const baseUrl = hostConfig.url
    const port =
        (hostConfig as { port?: number }).port ?? getPortFromUrl(baseUrl)
    const remoteConfigs = (await getRemoteConfigs(envMode)) as RemoteEntry[]
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
    // @module-federation/vite는 remoteEntry.js를 dist 루트에 출력함.
    // dev: Vite serve가 /remoteEntry.js 서빙. preview/build: dist/remoteEntry.js → /remoteEntry.js
    const remoteEntryPath = '/remoteEntry.js'
    const remotes: Record<
        string,
        { type: 'module'; name: string; entry: string }
    > = {}
    for (const r of remoteConfigs) {
        if (
            !r.name ||
            !r.url ||
            !Object.prototype.hasOwnProperty.call(remoteExposePaths, r.name)
        )
            continue
        const base = (r.url ?? '').replace(/\/$/, '')
        const entry = `${base}${remoteEntryPath}`
        remotes[r.name] = {
            type: 'module',
            name: r.name,
            entry,
        }
    }
    const shared = {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@repo/mf-modal-protocol': { singleton: true },
    }

    return {
        plugins: [
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
                shared,
                dts: false,
            }),
        ],
        define: {
            CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        },
        resolve: {
            alias: [
                {
                    find: '@repo/cesium-viewer-store',
                    replacement: path.resolve(
                        repoRoot,
                        'packages/fe/cesium-viewer-store/src/index.ts',
                    ),
                },
                {
                    find: '@repo/mf-modal-protocol',
                    replacement: path.resolve(
                        repoRoot,
                        'packages/fe/mf-modal-protocol/src/index.ts',
                    ),
                },
                {
                    find: 'config',
                    replacement: path.resolve(__dirname, '../../../../config'),
                },
                {
                    find: /^@\//,
                    replacement: `${path.resolve(__dirname, '../../../../packages/fe/ui/src')}/`,
                },
                {
                    find: /^src\//,
                    replacement: `${path.resolve(__dirname, 'src')}/`,
                },
                {
                    find: /^@assets\//,
                    replacement: `${path.resolve(__dirname, '../../../../packages/fe/ui/src/assets')}/`,
                },
            ],
            preserveSymlinks: false,
        },
        server: {
            origin: baseUrl,
            port,
            open: false,
            cors: true,
            hmr: {
                port,
                host: extractHostFromUrl(baseUrl),
            },
            fs: {
                allow: [repoRoot],
            },
        },
        preview: {
            host: extractHostFromUrl(baseUrl),
            port,
            strictPort: true,
            open: false,
            cors: true,
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
            commonjsOptions: {
                transformMixedEsModules: true,
            },
            minify: 'esbuild',
            sourcemap: false,
        },
    } as UserConfig
})
