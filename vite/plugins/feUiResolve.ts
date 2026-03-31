import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * @repo/fe-ui 패키지 내부의 상대 경로 import를 해석하기 위한 플러그인
 */
export function feUiResolvePlugin(): Plugin {
    return {
        name: 'fe-ui-resolve',
        resolveId(id, importer) {
            if (importer && importer.includes('packages/fe/ui/src')) {
                if (id.startsWith('../') || id.startsWith('./')) {
                    const importerDir = path.dirname(importer)
                    const resolvedPath = path.resolve(importerDir, id)

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
