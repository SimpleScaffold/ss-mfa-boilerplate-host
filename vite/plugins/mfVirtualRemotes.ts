import type { Plugin } from 'vite'

export type RemoteEntry = {
    name?: string
    url?: string
    displayName?: string
    modulePath?: string
    enabled?: boolean
}

export type RemoteExposePaths = Record<string, Record<string, string>>

export interface MfVirtualRemotesOptions {
    remoteExposePaths: RemoteExposePaths
    remotes: RemoteEntry[]
    modalModulePaths: string[]
    /** Remote별 모달 확장 설정 모듈 경로 (컴포넌트 아님, getModalEntries 등 제공) */
    modalExpansionModulePaths?: string[]
}

/** remotes·메뉴 기반 가상 모듈 + loadRemoteModule (import('remote/expose') 분기). */
export function mfVirtualRemotesPlugin(
    options: MfVirtualRemotesOptions,
): Plugin {
    const {
        remoteExposePaths,
        remotes,
        modalModulePaths,
        modalExpansionModulePaths = [],
    } = options

    const expansionPathsSet = new Set(modalExpansionModulePaths)

    const CONFIG_ID = 'virtual:mf-remotes-config'
    const IMPORTS_ID = 'virtual:mf-remote-imports'
    const RESOLVED_CONFIG_ID = `\0${CONFIG_ID}`
    const RESOLVED_IMPORTS_ID = `\0${IMPORTS_ID}`

    const builtRemotes = remotes.filter(
        (remote) =>
            remote.enabled !== false &&
            remote.name &&
            remoteExposePaths[remote.name],
    )
    const mainExpose = (name: string) =>
        remoteExposePaths[name]?.Measurement ??
        Object.keys(remoteExposePaths[name] || {})[0]
    const mainModulePaths = builtRemotes.map(
        (remote) => `${remote.name}/${mainExpose(remote.name!)}`,
    )
    const allMfPaths = [
        ...new Set([
            ...mainModulePaths,
            ...modalModulePaths,
            ...modalExpansionModulePaths,
        ]),
    ]

    const itemsStr = builtRemotes
        .map((remote) => {
            const id = remote.name!
            const name = remote.displayName || id
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
                const cases = allMfPaths
                    .map((modulePath) => {
                        const idStr = JSON.stringify(modulePath)
                        const isExpansion = expansionPathsSet.has(modulePath)
                        if (isExpansion) {
                            return (
                                `        case ${idStr}:\n` +
                                `            return import(${idStr})`
                            )
                        }
                        return (
                            `        case ${idStr}:\n` +
                            `            return import(${idStr}).then(function (m) {\n` +
                            `                var d = m && m.default;\n` +
                            `                if (d == null)\n` +
                            `                    return Promise.reject(new Error('Remote module has no valid default export: ' + ${idStr}));\n` +
                            `                var comp = typeof d === 'function' ? d : d.default;\n` +
                            `                if (typeof comp !== 'function')\n` +
                            `                    return Promise.reject(new Error('Remote default is not a component: ' + ${idStr}));\n` +
                            `                return { default: comp };\n` +
                            `            })`
                        )
                    })
                    .join('\n')
                return (
                    `/** virtual:mf-remote-imports */\n` +
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
