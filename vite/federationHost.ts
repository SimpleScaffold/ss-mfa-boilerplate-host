import type { RemoteConfig, RemoteExposePaths } from '../../../../../config'

/** @module-federation/vite Host remotes — Vite 원격은 ESM remoteEntry이므로 `type: 'module'` 필수 (미지정 시 classic script로 로드되어 import 구문 오류). */
export function buildFederationRemotes(
    remoteConfigs: RemoteConfig[],
    remoteExposePaths: RemoteExposePaths,
): Record<
    string,
    {
        type: 'module'
        name: string
        entry: string
        entryGlobalName: string
        shareScope: string
    }
> {
    const remotes: Record<
        string,
        {
            type: 'module'
            name: string
            entry: string
            entryGlobalName: string
            shareScope: string
        }
    > = {}
    const useProdEntry = process.env.NODE_ENV === 'production'
    for (const r of remoteConfigs) {
        if (!r.name || !remoteExposePaths[r.name]) continue
        const base = (r.url ?? '').replace(/\/$/, '')
        if (!base) continue
        const suffix = useProdEntry
            ? '/assets/remoteEntry.js'
            : '/remoteEntry.js'
        const entry = `${base}${suffix}`
        remotes[r.name] = {
            type: 'module',
            name: r.name,
            entry,
            entryGlobalName: r.name,
            shareScope: 'default',
        }
    }
    return remotes
}

/** Remote 앱 federation shared와 동일한 싱글톤 정책 (Host 측) */
export const hostFederationShared = {
    react: { singleton: true },
    'react-dom': { singleton: true },
} as const
