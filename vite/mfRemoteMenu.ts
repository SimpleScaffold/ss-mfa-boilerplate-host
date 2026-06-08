/**
 * Host 마이크로프론트: 메뉴 트리와 리모트 메인 expose 매핑.
 * (환경 URL 등 공용 설정은 루트 config/ — 이 파일은 host 앱 전용.)
 */

export type RemoteExposePaths = Record<string, Record<string, string>>

/**
 * 원격별 "메인" 노출 정보 (전체 앱 진입용). REMOTE_APPS·federation remotes 필터에 사용.
 * 새 remote 추가 시 리모트 vite의 `./${REMOTE_MODULE_NAME}` expose 이름과 맞출 것.
 */
export const REMOTE_MAIN_EXPOSES: Record<
    string,
    { path: string; exposeName: string }
> = {
    'ss-mfa-boilerplate-remote': {
        path: '/ss-mfa-boilerplate-remote',
        exposeName: 'ss-mfa-boilerplate-remote',
    },
}

/**
 * 메뉴 트리에서 '{remoteName}/{path}' 형태 LEAF url만 추출해 Host용 RemoteExposePaths 생성.
 */
export function getRemoteExposePathsFromMenu(
    menuTree: Array<{ type?: string; url?: string; children?: unknown[] }>,
    remoteNames: Set<string>,
    mainExposes: Record<string, { path: string; exposeName: string }> = {},
): RemoteExposePaths {
    const pathsByRemote = new Map<string, Set<string>>()
    function walk(items: typeof menuTree) {
        for (const item of items) {
            if (item.type === 'LEAF' && item.url?.includes('/')) {
                const [remoteName, ...pathParts] = item.url
                    .split('/')
                    .filter(Boolean)
                if (remoteNames.has(remoteName) && pathParts.length > 0) {
                    const pathSegment = pathParts.join('/')
                    if (!pathsByRemote.has(remoteName))
                        pathsByRemote.set(remoteName, new Set())
                    pathsByRemote.get(remoteName)!.add(pathSegment)
                }
            }
            if (item.children?.length) walk(item.children as typeof menuTree)
        }
    }
    walk(menuTree)

    const allRemoteNames = new Set([
        ...remoteNames,
        ...Object.keys(mainExposes),
    ])
    const result: RemoteExposePaths = {}
    for (const name of allRemoteNames) {
        const record: Record<string, string> = {}
        const main = mainExposes[name]
        if (main) record[main.exposeName] = main.path
        for (const pathSegment of pathsByRemote.get(name) ?? []) {
            record[pathSegment] = '/' + pathSegment
        }
        if (Object.keys(record).length > 0) result[name] = record
    }
    return result
}

/**
 * 메뉴 트리에서 '{remoteName}/{path}' LEAF만 MF modulePath 목록으로 변환.
 */
export function getModalModulePathsFromMenu(
    menuTree: Array<{ type?: string; url?: string; children?: unknown[] }>,
    remoteNames: Set<string>,
): string[] {
    const paths: string[] = []
    function walk(items: typeof menuTree) {
        for (const item of items) {
            if (item.type === 'LEAF' && item.url?.includes('/')) {
                const [remoteName, ...pathParts] = item.url
                    .split('/')
                    .filter(Boolean)
                if (remoteNames.has(remoteName) && pathParts.length > 0) {
                    const pathSegment = pathParts.join('/')
                    paths.push(`${remoteName}/${pathSegment}`)
                }
            }
            if (item.children?.length) walk(item.children as typeof menuTree)
        }
    }
    walk(menuTree)
    return [...new Set(paths)]
}

/** 모든 remote가 ModalExpansions를 expose한다고 가정하고 경로를 생성 */
export function getModalExpansionModulePaths(
    remoteNames: Set<string>,
): string[] {
    return [...remoteNames].map((name) => `${name}/ModalExpansions`)
}
