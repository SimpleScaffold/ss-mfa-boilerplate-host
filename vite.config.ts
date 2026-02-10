import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import { defineConfig, type Plugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    getHostConfig,
    getRemoteConfigs,
    type EnvMode,
} from '../../../../config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

type RemoteEntry = {
    name?: string
    displayName?: string
    modulePath?: string
    enabled?: boolean
    manifestUrl?: string
    origin?: string
    url?: string
}

const cesiumBaseUrl = 'cesiumStatic'
const cesiumSource = path.join(repoRoot, 'node_modules/cesium/Build/Cesium')

function extractHostFromOrigin(origin: string): string {
    const match = origin.replace(/^https?:\/\//, '').split(':')[0]
    return match || 'localhost'
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

// REMOTE_APP_2_ENTRY 제거: 동적으로 처리됨

/**
 * `config/env/*.ts` 기반 remote 설정을 "파일 생성 없이" 클라이언트 코드에서 사용할 수 있게
 * 가상 모듈로 제공합니다.
 *
 * - `virtual:mf-remotes-config`: REMOTE_APPS (라우팅/표시용 메타데이터)
 * - `virtual:mf-remote-imports`: loadRemoteModule() (MF 정적 import 매핑)
 */
function mfVirtualRemotesPlugin(remotes: RemoteEntry[]): Plugin {
    const CONFIG_ID = 'virtual:mf-remotes-config'
    const IMPORTS_ID = 'virtual:mf-remote-imports'
    const RESOLVED_CONFIG_ID = `\0${CONFIG_ID}`
    const RESOLVED_IMPORTS_ID = `\0${IMPORTS_ID}`

    function normalizeRemoteMeta() {
        const enabled = (remotes || []).filter((r) => r.enabled !== false)
        return enabled.map((r, i) => {
            const idx = i + 1
            const id = r.name || `remoteapp${idx}`
            const name = r.displayName || `Remote App ${idx}`
            const modulePath = r.modulePath || `${id}/RemoteApp${idx}`
            return {
                id,
                name,
                modulePath,
                fullPage: true,
                enabled: true,
            }
        })
    }

    return {
        name: 'mf-virtual-remotes',
        resolveId(id) {
            if (id === CONFIG_ID) return RESOLVED_CONFIG_ID
            if (id === IMPORTS_ID) return RESOLVED_IMPORTS_ID
            return null
        },
        load(id) {
            if (id === RESOLVED_CONFIG_ID) {
                const items = normalizeRemoteMeta()
                    .map(
                        (r) =>
                            `    {\n` +
                            `        id: ${JSON.stringify(r.id)},\n` +
                            `        name: ${JSON.stringify(r.name)},\n` +
                            `        modulePath: ${JSON.stringify(r.modulePath)},\n` +
                            `        fullPage: true,\n` +
                            `        enabled: true,\n` +
                            `    },`,
                    )
                    .join('\n')

                return (
                    `/**\n` +
                    ` * ⚠ VIRTUAL MODULE\n` +
                    ` *\n` +
                    ` * 생성 소스: config/env/*.ts (예: local.ts)\n` +
                    ` * 생성 시점: ${new Date().toISOString()}\n` +
                    ` */\n\n` +
                    `export const REMOTE_APPS = [\n` +
                    `${items}\n` +
                    `]\n`
                )
            }

            if (id === RESOLVED_IMPORTS_ID) {
                const items = normalizeRemoteMeta()
                const cases = items
                    .map(
                        (r) =>
                            `        case ${JSON.stringify(r.modulePath)}:\n` +
                            `            return import(${JSON.stringify(r.modulePath)})`,
                    )
                    .join('\n')

                return (
                    `/**\n` +
                    ` * ⚠ VIRTUAL MODULE\n` +
                    ` *\n` +
                    ` * 생성 소스: config/env/*.ts (예: local.ts)\n` +
                    ` * 생성 시점: ${new Date().toISOString()}\n` +
                    ` */\n\n` +
                    `export function loadRemoteModule(modulePath) {\n` +
                    `    switch (modulePath) {\n` +
                    `${cases || ''}\n` +
                    `        default:\n` +
                    `            return Promise.reject(\n` +
                    '                new Error(`Unknown remote module path: ${modulePath}`),\n' +
                    `            )\n` +
                    `    }\n` +
                    `}\n`
                )
            }

            return null
        },
    }
}

export default defineConfig(({ command }) => {
    const envMode = (process.env.MF_ENV || 'local') as EnvMode
    const hostConfig = getHostConfig(envMode) as {
        origin: string
        port: number
    }
    const remoteConfigs = getRemoteConfigs(envMode) as RemoteEntry[]

    const isDev = command === 'serve'
    // dev에서는 MF shared가 optimizeDeps/prebuild 레이스를 유발할 수 있어 비활성화
    const shared: Record<string, { singleton?: boolean }> = isDev
        ? {}
        : {
              react: { singleton: true },
              'react-dom': { singleton: true },
          }

    return {
        plugins: [
            feUiResolvePlugin(),
            mfVirtualRemotesPlugin(remoteConfigs),
            react(),
            tailwindcss(),
            cesiumStaticPlugin(),
            // Cesium 정적 파일을 빌드 시 복사 (preview 모드에서도 사용 가능하도록)
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
                manifest: true,
                remotes: remoteConfigs.reduce(
                    (acc, r) => {
                        if (r.name && r.manifestUrl) {
                            acc[r.name] = {
                                type: 'module' as const,
                                name: r.name,
                                entry: r.manifestUrl,
                            }
                        }
                        return acc
                    },
                    {} as Record<
                        string,
                        { type: 'module'; name: string; entry: string }
                    >,
                ),
                shared,
                dts: false,
                // hostInit을 엔트리 파일에 포함 (HTML이 아닌 엔트리에서 실행)
                hostInitInjectLocation: 'entry',
                // eval 사용을 피하기 위한 설정
                runtimePlugins: [],
                // SDK의 불필요한 기능 비활성화 (eval 사용 방지)
                ...(isDev && {
                    dev: {
                        disableRuntimePlugins: true,
                    },
                }),
            }),
        ],
        define: {
            CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        },
        resolve: {
            alias: [
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
            origin: hostConfig.origin,
            port: hostConfig.port,
            open: false, // 오케스트레이터에서 안정화 후 open
            cors: true,
            hmr: {
                port: hostConfig.port,
                host: extractHostFromOrigin(hostConfig.origin),
            },
            fs: {
                allow: [repoRoot],
            },
        },
        build: {
            target: 'chrome107',

            rollupOptions: {
                // Module Federation SDK의 eval 경고 억제
                // 참고: doc/kr/11-code-quality/build-eval-warning.md
                onwarn(warning, warn) {
                    if (
                        warning.code === 'EVAL' &&
                        warning.id?.includes('@module-federation/sdk')
                    ) {
                        return
                    }
                    warn(warning)
                },
                output: {
                    format: 'es',
                    // eval 사용 방지를 위한 설정
                    generatedCode: {
                        constBindings: true,
                        objectShorthand: true,
                    },
                    // eval 대신 함수로 변환
                    strict: false,
                    // Module Federation 사용 시 수동 청크 강제 분할은
                    // 엔트리/런타임 체인 충돌을 만들 수 있어 기본 전략을 사용합니다.
                    manualChunks: undefined,
                },
                // eval 사용 방지
                external: [],
            },
            commonjsOptions: {
                transformMixedEsModules: true,
            },
            minify: 'esbuild',
            // eval 사용 방지
            sourcemap: false,
        },
    }
})
