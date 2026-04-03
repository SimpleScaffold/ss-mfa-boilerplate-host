import type { ProxyOptions } from 'vite'

/**
 * 로컬 dev 서버 전용 — `terrainUrl.ts`의 `/terr-svr`와 경로를 맞춥니다.
 * 배포 시 nginx 등은 동일 rewrite 규칙으로 맞추면 됩니다.
 */
export const devServerProxy: Record<string, ProxyOptions> = {
    '/terr-svr': {
        target: 'http://10.10.20.163:8000',
        changeOrigin: true,
        rewrite: (p) =>
            p.replace(
                /^\/terr-svr/,
                '/lxpf-svc3d-back-terr-svc/tilesets/CTB_2024',
            ),
    },
}
