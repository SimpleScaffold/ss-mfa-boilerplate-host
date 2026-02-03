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

// local.ts에서 모든 remote 설정 가져오기
const remoteConfigs = getRemoteConfigs(envMode) as Array<{
    name?: string
    manifestUrl?: string
    port?: number
    origin?: string
    url?: string
}>

const SHARED_DEPENDENCIES = {
    react: { singleton: true },
    'react/': { singleton: true },
    'react-dom': { singleton: true },
} as const

// REMOTE_APP_2_ENTRY 제거: 동적으로 처리됨

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
                  (listenForRemoteRebuilds({
                      allowedApps: remoteConfigs
                          .map((r) => r.name)
                          .filter((n): n is string => !!n),
                  }) as unknown as Plugin),
              ]
            : []),
        federation({
            name: 'ss-front-boilerplate-micro-host-vite-ts',
            manifest: true,
            remotes: remoteConfigs.reduce((acc, remote) => {
                if (remote.name && remote.manifestUrl) {
                    acc[remote.name] = {
                        type: 'module' as const,
                        name: remote.name,
                        entry: remote.manifestUrl,
                    }
                }
                return acc
            }, {} as Record<string, { type: 'module'; name: string; entry: string }>),
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
