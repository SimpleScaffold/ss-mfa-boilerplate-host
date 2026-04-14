import https from 'node:https'
import type { ProxyOptions } from 'vite'

/**
 * OSM 업스트림을 IPv4로 고정합니다.
 * WSL2·일부 네트워크에서 IPv6 경로가 막히면 Node 프록시가 `ETIMEDOUT`(internalConnectMultiple)으로 끊깁니다.
 */
const osmUpstreamAgent = new https.Agent({
    family: 4,
    keepAlive: true,
})

/**
 * 로컬 dev 서버 전용 — `terrainUrl.ts`의 `/terr-svr`와 경로를 맞춥니다.
 * 배포 시 nginx 등은 동일 rewrite 규칙으로 맞추면 됩니다.
 *
 * OSM: `headers`로 User-Agent 전달. 여전히 타임아웃이면 방화벽·VPN·프록시 환경을 확인하거나
 * `NODE_OPTIONS=--dns-result-order=ipv4first` 로 실행해 볼 수 있습니다.
 */
export const devServerProxy: Record<string, ProxyOptions> = {
    '/osm-tiles': {
        target: 'https://tile.openstreetmap.org',
        changeOrigin: true,
        secure: true,
        agent: osmUpstreamAgent,
        rewrite: (p) => p.replace(/^\/osm-tiles/, ''),
        headers: {
            'User-Agent': 'micro-platform/dev (Cesium OSM tiles; vite proxy)',
        },
    },
    '/terr-svr': {
        target: 'http://106.245.249.226:16000',
        changeOrigin: true,
        rewrite: (p) =>
            p.replace(
                /^\/terr-svr/,
                // Cesium은 `/terr-svr/layer.json` 등을 요청 → 실제 quantized-mesh 루트는 tilesets 하위 데이터셋 폴더
                '/lxpf-svc3d-back-terr-svc/tilesets/CTB_2024',
            ),
    },
}
