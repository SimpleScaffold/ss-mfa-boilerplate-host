import react from '@vitejs/plugin-react-swc'
import path, { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import fs, { copyFileSync } from 'fs'
import { federation } from '@module-federation/vite'
import { listenForRemoteRebuilds } from '@antdevx/vite-plugin-hmr-sync'
import { fileURLToPath } from 'url'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import {
    getHostConfig,
    getRemoteConfigs,
    type EnvMode,
} from '../../../../config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

const DEFAULT_ENV_MODE = 'local' as const

const envMode = (process.env.MF_ENV || DEFAULT_ENV_MODE) as EnvMode
// NOTE: config 로더는 런타임 환경에 따라 타입이 넓게 잡힐 수 있어,
// vite.config.ts에서는 필요한 필드만 보장하도록 캐스팅합니다.
const hostConfig = getHostConfig(envMode) as { origin: string; port: number }

type RemoteEntry = {
    name?: string
    displayName?: string
    routePath?: string
    modulePath?: string
    enabled?: boolean
    manifestUrl?: string
    port?: number
    origin?: string
    url?: string
}

// local.ts에서 모든 remote 설정 가져오기
const remoteConfigs = getRemoteConfigs(envMode) as RemoteEntry[]

const SHARED_DEPENDENCIES = {
    react: { singleton: true },
    'react/': { singleton: true },
    'react-dom': { singleton: true },
} as const

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

function extractHostFromOrigin(origin: string): string {
    const match = origin.replace(/^https?:\/\//, '').split(':')[0]
    return match || 'localhost'
}

// Cesium 설정
const cesiumSource = path.join(repoRoot, 'node_modules/cesium/Build/Cesium')
const cesiumBaseUrl = 'cesiumStatic'

// Cesium 정적 파일을 개발 서버에서 서빙하는 플러그인
function cesiumStaticPlugin(): Plugin {
    return {
        name: 'cesium-static',
        configureServer(server) {
            server.middlewares.use(`/${cesiumBaseUrl}`, (req, res, next) => {
                const url = req.url || ''
                // 쿼리 스트링 제거
                const cleanUrl = url.split('?')[0]
                // /cesiumStatic/Workers/... -> Workers/...
                const relativePath = cleanUrl.replace(`/${cesiumBaseUrl}/`, '')

                const filePath = path.join(cesiumSource, relativePath)

                // 파일이 존재하는지 확인
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    // MIME 타입 설정
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
                    const contentType =
                        mimeTypes[ext] || 'application/octet-stream'
                    res.setHeader('Content-Type', contentType)
                    res.setHeader('Access-Control-Allow-Origin', '*')
                    fs.createReadStream(filePath).pipe(res)
                    return
                }
                next()
            })
        },
    }
}

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: 'chrome107',
        modulePreload: false,
        rollupOptions: {
            output: {
                format: 'es',
                manualChunks: {
                    // Cesium 관련 모듈 (매우 큰 라이브러리)
                    'vendor-cesium': ['cesium'],
                    // React 관련 모듈
                    'vendor-react': [
                        'react',
                        'react-dom',
                        // 'scheduler',
                        'react/jsx-runtime',
                    ],
                    // Redux 관련 모듈
                    'vendor-redux': [
                        '@reduxjs/toolkit',
                        'react-redux',
                        'redux',
                        'redux-saga',
                    ],
                    // Router 관련 모듈
                    'vendor-router': ['react-router'],
                    // Table 관련 모듈
                    'vendor-table': [
                        '@tanstack/react-table',
                        '@tanstack/react-virtual',
                    ],
                    // i18n 관련 모듈
                    // 'vendor-i18n': ['i18next', 'react-i18next'],
                    // 애니메이션 관련 모듈
                    // 'vendor-motion': ['framer-motion'],
                    // 아이콘 관련 모듈
                    'vendor-icons': ['lucide-react'],
                    // Radix UI 관련 모듈
                    /*
                    'vendor-radix': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-label',
                        '@radix-ui/react-scroll-area',
                        '@radix-ui/react-separator',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-switch',
                        '@radix-ui/react-tabs',
                        '@radix-ui/react-tooltip',
                    ],
                    */
                },
            },
        },
    },
    plugins: [
        mfVirtualRemotesPlugin(remoteConfigs),
        react(),
        tailwindcss(),
        fontPreloadPlugin(),
        copyRobotsTxt(),
        // waitForRemote() 플러그인 제거: scripts/wait-for-remote.ts에서 이미 처리함
        cesiumStaticPlugin(),
        viteStaticCopy({
            targets: [
                {
                    src: path.join(cesiumSource, 'ThirdParty'),
                    dest: cesiumBaseUrl,
                },
                {
                    src: path.join(cesiumSource, 'Workers'),
                    dest: cesiumBaseUrl,
                },
                { src: path.join(cesiumSource, 'Assets'), dest: cesiumBaseUrl },
                {
                    src: path.join(cesiumSource, 'Widgets'),
                    dest: cesiumBaseUrl,
                },
            ],
        }),
        ...(envMode === 'local'
            ? [
                  // NOTE:
                  // Yarn(node-modules) 환경에서 vite가 중복 설치되면(루트/워크스페이스)
                  // @antdevx/vite-plugin-hmr-sync의 Plugin 타입과 현재 파일의 PluginOption 타입이 달라져
                  // TS 오버로드 에러가 발생할 수 있습니다. 런타임에는 문제 없어서 캐스팅으로 해결합니다.
                  listenForRemoteRebuilds({
                      allowedApps: remoteConfigs
                          .map((r) => r.name)
                          .filter((n): n is string => !!n),
                  }) as unknown as Plugin,
              ]
            : []),
        federation({
            name: 'ss-front-boilerplate-micro-host-vite-ts',
            manifest: true,
            remotes: remoteConfigs.reduce(
                (acc, remote) => {
                    if (remote.name && remote.manifestUrl) {
                        acc[remote.name] = {
                            type: 'module' as const,
                            name: remote.name,
                            entry: remote.manifestUrl,
                        }
                    }
                    return acc
                },
                {} as Record<
                    string,
                    { type: 'module'; name: string; entry: string }
                >,
            ),
            shared: SHARED_DEPENDENCIES,
            dts: false,
            // 타입 정의 버전에 따라 dev 옵션이 달라질 수 있어 캐스팅으로 안정화
        }),
    ],
    define: {
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
    },
    optimizeDeps: {
        exclude: ['@module-federation/runtime'],
        // 첫 로드 시점에 react 계열/JSX 런타임을 확실히 prebundle해서
        // `504 Outdated Optimize Dep`(특히 MF virtual prebuild) 발생 확률을 낮춥니다.
        include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
        ],
        esbuildOptions: {
            target: 'esnext',
        },
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
    },
    server: {
        origin: hostConfig.origin,
        port: hostConfig.port,
        // remote는 먼저 떠야 안정적이지만, 브라우저는 host(쉘) 쪽을 여는 게 UX가 좋습니다.
        // (remote가 먼저 뜨며 터미널에 URL이 노출될 때 12000이 자동으로 열리는 문제도 예방)
        open: true,
        hmr: {
            port: hostConfig.port,
            host: extractHostFromOrigin(hostConfig.origin),
        },
        fs: {
            allow: [repoRoot],
        },
    },
})

// 폰트를 자동으로 preload하는 플러그인
function fontPreloadPlugin(): Plugin {
    return {
        name: 'vite-font-preload',
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                const fontDir = path.resolve(
                    __dirname,
                    '../../../../packages/fe/ui/src/assets/fonts',
                )
                const preloadLinks: string[] = []
                const usedFonts = getUsedFonts(html)

                function walk(dir: string) {
                    const files = fs.readdirSync(dir)
                    for (const file of files) {
                        const fullPath = path.join(dir, file)
                        const stat = fs.statSync(fullPath)
                        if (stat.isDirectory()) {
                            walk(fullPath)
                        } else if (
                            file.endsWith('.woff') ||
                            file.endsWith('.woff2')
                        ) {
                            const publicPath = fullPath
                                .split('assets')[1]
                                .replace(/\\/g, '/')
                            const type = file.endsWith('.woff2')
                                ? 'font/woff2'
                                : 'font/woff'
                            const fontName = file.split('.')[0]
                            if (usedFonts.includes(fontName)) {
                                preloadLinks.push(
                                    `<link rel="preload" href="/assets${publicPath}" as="font" type="${type}" crossorigin>`,
                                )
                            }
                        }
                    }
                }

                walk(fontDir)
                return html.replace(
                    '</head>',
                    preloadLinks.join('\n') + '\n</head>',
                )
            },
        },
    }
}

// HTML에서 사용된 폰트를 추출하는 함수
function getUsedFonts(html: string): string[] {
    const fontRegex = /font-family:\s*['"]?([^;'"]+)['"]?/g
    const usedFonts: string[] = []
    let match
    while ((match = fontRegex.exec(html)) !== null) {
        usedFonts.push(match[1].toLowerCase())
    }
    return usedFonts
}

// 커스텀 플러그인: 빌드 후 robots.txt 복사
function copyRobotsTxt() {
    return {
        name: 'copy-robots-txt',
        closeBundle() {
            const robotsTxtPath = resolve(__dirname, 'robots.txt')
            if (fs.existsSync(robotsTxtPath)) {
                copyFileSync(
                    robotsTxtPath,
                    resolve(__dirname, 'dist/robots.txt'),
                )
            }
        },
    }
}
