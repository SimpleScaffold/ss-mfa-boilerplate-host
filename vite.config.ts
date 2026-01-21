import react from '@vitejs/plugin-react-swc'
import path, { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import fs, { copyFileSync } from 'fs'
import { federation } from '@module-federation/vite'
import { listenForRemoteRebuilds } from '@antdevx/vite-plugin-hmr-sync'
import { fileURLToPath } from 'url'
import http from 'http'
import {
    getHostConfig,
    getRemoteConfig,
    type EnvMode,
} from '../../../../config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

const DEFAULT_ENV_MODE = 'local' as const
const REMOTE_APP_2_PORT = 3003
const HTTP_TIMEOUT_MS = 1000
const MAX_RETRIES = 30
const RETRY_DELAY_MS = 1000

const envMode = (process.env.MF_ENV || DEFAULT_ENV_MODE) as EnvMode
const hostConfig = getHostConfig(envMode)
const remoteConfig = getRemoteConfig(envMode)

const REMOTE_APP_URLS = {
    remoteapp1: remoteConfig.manifestUrl,
    remoteapp2: `http://localhost:${REMOTE_APP_2_PORT}/mf-manifest.json`,
} as const

function waitForRemoteApp(
    remoteUrl: string,
    maxRetries = MAX_RETRIES,
    delay = RETRY_DELAY_MS
): Promise<void> {
    return new Promise((resolve) => {
        let retryCount = 0

        const attemptConnection = async (): Promise<void> => {
            try {
                await new Promise<void>((resolve, reject) => {
                    const request = http.get(remoteUrl, (response) => {
                        if (response.statusCode === 200) {
                            resolve()
                        } else {
                            reject(
                                new Error(
                                    `HTTP ${response.statusCode ?? 'unknown'}`
                                )
                            )
                        }
                    })

                    request.on('error', reject)
                    request.setTimeout(HTTP_TIMEOUT_MS, () => {
                        request.destroy()
                        reject(new Error('Connection timeout'))
                    })
                })

                console.log('✓ Remote app is ready')
                resolve()
            } catch (error) {
                retryCount++

                if (retryCount === 1) {
                    console.log('⏳ Waiting for remote app to be ready...')
                }

                if (retryCount >= maxRetries) {
                    console.warn(
                        '⚠ Remote app did not become ready, continuing anyway...'
                    )
                    resolve()
                    return
                }

                await new Promise((resolve) => setTimeout(resolve, delay))
                return attemptConnection()
            }
        }

        attemptConnection()
    })
}

function waitForRemote(): Plugin {
    let waitPromise: Promise<void> | null = null

    return {
        name: 'wait-for-remote',
        configureServer(server) {
            if (envMode === 'local') {
                waitPromise = Promise.all([
                    waitForRemoteApp(REMOTE_APP_URLS.remoteapp1),
                    waitForRemoteApp(REMOTE_APP_URLS.remoteapp2),
                ]).then(() => undefined)
            }

            server.middlewares.use(async (_req, _res, next) => {
                if (waitPromise) {
                    await waitPromise
                    waitPromise = null
                }
                next()
            })
        },
    }
}

const SHARED_DEPENDENCIES = {
    react: { singleton: true },
    'react/': { singleton: true },
    'react-dom': { singleton: true },
} as const

const REMOTE_APP_2_ENTRY =
    envMode === 'local'
        ? REMOTE_APP_URLS.remoteapp2
        : remoteConfig.manifestUrl.replace('3002', String(REMOTE_APP_2_PORT))

function extractHostFromOrigin(origin: string): string {
    const match = origin.replace(/^https?:\/\//, '').split(':')[0]
    return match || 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: 'chrome89',
        rollupOptions: {
            output: {
                manualChunks: {
                    // React 관련 모듈
                    'vendor-react': [
                        'react',
                        'react-dom',
                        'scheduler',
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
                    'vendor-i18n': ['i18next', 'react-i18next'],
                    // 애니메이션 관련 모듈
                    'vendor-motion': ['framer-motion'],
                    // 아이콘 관련 모듈
                    'vendor-icons': ['lucide-react'],
                    // Radix UI 관련 모듈
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
                },
            },
        },
    },
    plugins: [
        react(),
        tailwindcss(),
        fontPreloadPlugin(),
        copyRobotsTxt(),
        waitForRemote(),
        ...(envMode === 'local'
            ? [
                  listenForRemoteRebuilds({
                      allowedApps: ['remoteapp1', 'remoteapp2'],
                      hotPayload: 'full-reload',
                  }),
              ]
            : []),
        federation({
            name: 'ss-front-boilerplate-micro-host-vite-ts',
            manifest: true,
            remotes: {
                remoteapp1: {
                    type: 'module',
                    name: 'remoteapp1',
                    entry: remoteConfig.manifestUrl,
                },
                remoteapp2: {
                    type: 'module',
                    name: 'remoteapp2',
                    entry: REMOTE_APP_2_ENTRY,
                },
            },
            shared: SHARED_DEPENDENCIES,
            dts: false,
        }),
    ],
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
                const fontDir = path.resolve(__dirname, '../../../../packages/fe/ui/src/assets/fonts')
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
