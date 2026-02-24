import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'
import { defineConfig, type Plugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    getHostConfig,
    getRemoteConfigs,
    getModalModulePathsFromMenu,
    ENV_MODE,
    type EnvMode,
} from '../../../../config'
import { MOCK_MENU_DATA } from './src/features/menu/data/menuMockData'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

type RemoteEntry = {
    name?: string
    url?: string
    displayName?: string
    modulePath?: string
    enabled?: boolean
    manifestUrl?: string
}

const cesiumBaseUrl = 'cesiumStatic'
const cesiumSource = path.join(repoRoot, 'node_modules/cesium/Build/Cesium')

function extractHostFromUrl(url: string): string {
    const u = (url ?? '').replace(/^https?:\/\//, '').split(':')[0]
    return u || 'localhost'
}

function getPortFromUrl(url: string): number {
    try {
        const p = new URL(url).port
        return p ? parseInt(p, 10) : 5173
    } catch {
        return 5173
    }
}

function cesiumStaticPlugin(): Plugin {
    return {
        name: 'cesium-static',
        configureServer(server) {
            server.middlewares.use(`/${cesiumBaseUrl}`, (req, res, next) => {
                const url = req.url || ''
                const cleanUrl = url.split('?')[0]
                const relativePath = cleanUrl.replace(`/${cesiumBaseUrl}/`, '')
                const filePath = path.join(cesiumSource, relativePath)

                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    const ext = path.extname(filePath)
                    const mimeTypes: Record<string, string> = {
                        '.js': 'application/javascript',
                        '.json': 'application/json',
                        '.wasm': 'application/wasm',
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.css': 'text/css',
                        '.html': 'text/html',
                    }
                    res.setHeader(
                        'Content-Type',
                        mimeTypes[ext] || 'application/octet-stream',
                    )
                    res.setHeader('Access-Control-Allow-Origin', '*')
                    fs.createReadStream(filePath).pipe(res)
                    return
                }
                next()
            })
        },
    }
}

// @repo/fe-ui 패키지 내부의 상대 경로 import를 해석하기 위한 플러그인
function feUiResolvePlugin(): Plugin {
    return {
        name: 'fe-ui-resolve',
        resolveId(id, importer) {
            // @repo/fe-ui 패키지 내부의 상대 경로 import를 해석
            if (importer && importer.includes('packages/fe/ui/src')) {
                // 상대 경로 import인 경우
                if (id.startsWith('../') || id.startsWith('./')) {
                    const importerDir = path.dirname(importer)
                    const resolvedPath = path.resolve(importerDir, id)

                    // .ts 확장자가 없으면 추가
                    if (
                        !resolvedPath.endsWith('.ts') &&
                        !resolvedPath.endsWith('.tsx')
                    ) {
                        if (fs.existsSync(resolvedPath + '.ts')) {
                            return resolvedPath + '.ts'
                        }
                        if (fs.existsSync(resolvedPath + '.tsx')) {
                            return resolvedPath + '.tsx'
                        }
                        if (fs.existsSync(resolvedPath + '/index.ts')) {
                            return resolvedPath + '/index.ts'
                        }
                        if (fs.existsSync(resolvedPath + '/index.tsx')) {
                            return resolvedPath + '/index.tsx'
                        }
                    }

                    if (fs.existsSync(resolvedPath)) {
                        return resolvedPath
                    }
                }
            }
            return null
        },
    }
}

/**
 * Remote별 expose 이름 → Vite dev 서버 내 소스 경로.
 * yarn dev로 띄운 remote에서 해당 URL로 import()하여 로드함.
 */
const REMOTE_EXPOSE_PATHS: Record<string, Record<string, string>> = {
    measurement: {
        Measurement: '/measurement',
        PlanarDistance: '/planar-distance',
    },
}

/**
 * config/env 기반 remote 설정 + loadRemoteModule.
 * - dev: 원격 URL로 import() → remote yarn dev 핫 리로드 가능
 * - build: MF getRemote 사용 → 프로덕션 최적화
 */
function mfVirtualRemotesPlugin(
    remotes: RemoteEntry[],
    modalModulePaths: string[],
    isDev: boolean,
): Plugin {
    const CONFIG_ID = 'virtual:mf-remotes-config'
    const IMPORTS_ID = 'virtual:mf-remote-imports'
    const RESOLVED_CONFIG_ID = `\0${CONFIG_ID}`
    const RESOLVED_IMPORTS_ID = `\0${IMPORTS_ID}`

    const builtRemotes = remotes.filter(
        (r) => r.enabled !== false && r.name && REMOTE_EXPOSE_PATHS[r.name],
    )
    const mainExpose = (name: string) =>
        REMOTE_EXPOSE_PATHS[name]?.Measurement ??
        Object.keys(REMOTE_EXPOSE_PATHS[name] || {})[0]
    const mainModulePaths = builtRemotes.map(
        (r) => `${r.name}/${mainExpose(r.name!)}`,
    )
    const allMfPaths = [...new Set([...mainModulePaths, ...modalModulePaths])]

    const itemsStr = builtRemotes
        .map((r) => {
            const id = r.name!
            const name = r.displayName || id
            const modulePath = `${id}/${mainExpose(id)}`
            return (
                `    {\n` +
                `        id: ${JSON.stringify(id)},\n` +
                `        name: ${JSON.stringify(name)},\n` +
                `        modulePath: ${JSON.stringify(modulePath)},\n` +
                `        fullPage: true,\n` +
                `        enabled: true,\n` +
                `    },`
            )
        })
        .join('\n')

    const exposePathsJson = JSON.stringify(REMOTE_EXPOSE_PATHS)

    return {
        name: 'mf-virtual-remotes',
        resolveId(id) {
            if (id === CONFIG_ID) return RESOLVED_CONFIG_ID
            if (id === IMPORTS_ID) return RESOLVED_IMPORTS_ID
            return null
        },
        load(id) {
            if (id === RESOLVED_CONFIG_ID) {
                return (
                    `/** virtual:mf-remotes-config */\n\n` +
                    `export const REMOTE_APPS = [\n${itemsStr || ''}\n]\n`
                )
            }

            if (id === RESOLVED_IMPORTS_ID) {
                if (isDev) {
                    return (
                        `/** virtual:mf-remote-imports (dev: 원격 URL import, 핫 리로드) */\n` +
                        `import { getRemoteConfigByNameSync } from 'config'\n\n` +
                        `const REMOTE_EXPOSE_PATHS = ${exposePathsJson}\n\n` +
                        `export function loadRemoteModule(modulePath) {\n` +
                        `    const [remoteName, exposeName] = modulePath.split('/')\n` +
                        `    const remote = getRemoteConfigByNameSync(remoteName)\n` +
                        `    if (!remote?.url) return Promise.reject(new Error(\`Remote not found: \${remoteName}\`))\n` +
                        `    const paths = REMOTE_EXPOSE_PATHS[remoteName]\n` +
                        `    const exposePath = paths?.[exposeName]\n` +
                        `    if (!exposePath) return Promise.reject(new Error(\`Expose not found: \${modulePath}\`))\n` +
                        `    const base = remote.url.replace(/\\/$/, '')\n` +
                        `    const fullUrl = base + exposePath\n` +
                        `    return import(/* @vite-ignore */ fullUrl).then(m => ({ default: m.default }))\n` +
                        `}\n`
                    )
                }
                const cases = allMfPaths
                    .map((modulePath) => {
                        const [remoteName, exposeName] = modulePath.split('/')
                        const exposePath = `./${exposeName}`
                        return (
                            `        case ${JSON.stringify(modulePath)}:\n` +
                            `            return getRemote(${JSON.stringify(remoteName)}, ${JSON.stringify(exposePath)}).then(unwrapDefault)`
                        )
                    })
                    .join('\n')
                return (
                    `/** virtual:mf-remote-imports (build: MF) */\n` +
                    `import { __federation_method_getRemote as getRemote, __federation_method_unwrapDefault as unwrapDefault } from "virtual:__federation__"\n\n` +
                    `export function loadRemoteModule(modulePath) {\n` +
                    `    switch (modulePath) {\n` +
                    `${cases}\n` +
                    `        default:\n` +
                    `            return Promise.reject(new Error(\`Unknown remote module path: \${modulePath}\`))\n` +
                    `    }\n` +
                    `}\n`
                )
            }

            return null
        },
    }
}

export default defineConfig(async ({ command }) => {
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
    const isDev = command === 'serve'

    const remotesForMf = remoteConfigs
        .filter(
            (r) =>
                r.name &&
                r.url &&
                Object.prototype.hasOwnProperty.call(
                    REMOTE_EXPOSE_PATHS,
                    r.name,
                ),
        )
        .map((r) => {
            const base = (r.url ?? '').replace(/\/$/, '')
            return [r.name, `${base}/assets/remoteEntry.js`] as const
        })
    const remotes = Object.fromEntries(remotesForMf)
    const shared = isDev
        ? []
        : { react: { singleton: true }, 'react-dom': { singleton: true } }

    return {
        plugins: [
            feUiResolvePlugin(),
            mfVirtualRemotesPlugin(remoteConfigs, modalModulePaths, isDev),
            react(),
            tailwindcss(),
            cesiumStaticPlugin(),
            viteStaticCopy({
                targets: [
                    {
                        src: path.join(cesiumSource, '**/*'),
                        dest: cesiumBaseUrl,
                    },
                ],
            }),
            federation({
                name: 'hostapp1',
                remotes,
                shared,
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
            // @repo/fe-ui 패키지 내부의 상대 경로 import를 해석하기 위한 설정
            preserveSymlinks: false,
        },
        server: {
            origin: baseUrl,
            port,
            open: false, // 오케스트레이터에서 안정화 후 open
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
    }
})
