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
    type RemoteExposePaths,
} from '../../../../config/vite'
import { MOCK_MENU_DATA } from './src/features/menu/data/menuMockData'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

const REMOTE_EXPOSE_PATHS: RemoteExposePaths = {
    measurement: {
        Measurement: '/measurement',
        PlanarDistance: '/planar-distance',
    },
}

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
    const modalModulePaths = getModalModulePathsFromMenu(
        MOCK_MENU_DATA,
        remoteNames,
    )
    const isDev = command === 'serve' && envMode === ENV_MODE.LOCAL
    const remoteEntryPath = isDev ? '/remoteEntry.js' : '/assets/remoteEntry.js'
    const remotes: Record<
        string,
        { type: 'module'; name: string; entry: string }
    > = {}
    for (const r of remoteConfigs) {
        if (
            !r.name ||
            !r.url ||
            !Object.prototype.hasOwnProperty.call(REMOTE_EXPOSE_PATHS, r.name)
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
    }

    return {
        plugins: [
            feUiResolvePlugin(),
            mfVirtualRemotesPlugin({
                remoteExposePaths: REMOTE_EXPOSE_PATHS,
                remotes: remoteConfigs,
                modalModulePaths,
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
