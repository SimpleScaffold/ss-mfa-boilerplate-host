import sharedConfig from '@repo/shared-config/eslint.config.js'

export default [
    ...sharedConfig,
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.config.js',
            '.__mf__temp/**',
            '**/localSharedImportMap.js',
        ],
    },
]
