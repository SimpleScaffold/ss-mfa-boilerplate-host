declare module 'virtual:mf-remotes-config' {
    export const REMOTE_APPS: Array<{
        id: string
        name: string
        modulePath: string
        fullPage?: boolean
        layoutSlot?: 'main' | 'sidebar' | 'header' | 'footer'
        enabled?: boolean
    }>
}

declare module 'virtual:mf-remote-imports' {
    import type { ComponentType } from 'react'
    export function loadRemoteModule(
        modulePath: string,
    ): Promise<{ default: ComponentType<Record<string, unknown>> }>
}
