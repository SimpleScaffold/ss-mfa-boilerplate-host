/**
 * 첫 접속 타이밍에 optimizeDeps가 갱신되면 504(Outdated Optimize Dep)로 깨질 수 있어,
 * "완료 신호(= optimizeDeps 안정화)"를 확인한 뒤 자동으로 재시도/새로고침해서 복구합니다.
 * dev 모드에서만 사용 (preview/production에서는 불필요)
 */
export function setupViteFirstLoadRecovery() {
    if (typeof window === 'undefined') return

    const COUNT_KEY = '__mf_vite_firstload_recover_count__'
    const RUNNING_KEY = '__mf_vite_firstload_recover_running__'
    const MAX_RECOVERIES = 3
    const POLL_MS = 300
    const MAX_POLLS = 80 // ~24s

    const getCount = () => {
        try {
            return Number(sessionStorage.getItem(COUNT_KEY) || '0')
        } catch {
            return 0
        }
    }
    const incCount = () => {
        try {
            sessionStorage.setItem(COUNT_KEY, String(getCount() + 1))
        } catch {
            // ignore
        }
    }
    const getRunning = () => {
        try {
            return sessionStorage.getItem(RUNNING_KEY) === '1'
        } catch {
            return false
        }
    }
    const setRunning = (v: boolean) => {
        try {
            sessionStorage.setItem(RUNNING_KEY, v ? '1' : '0')
        } catch {
            // ignore
        }
    }

    async function waitUntilOptimizeDepsReady(): Promise<boolean> {
        // "완료 신호" 정의:
        // - index HTML이 Outdated Optimize Dep를 포함하지 않음
        // - deps metadata가 정상 JSON
        // - browserHash가 연속 2번 동일하게 관측됨(= 재최적화가 끝남)
        let lastHash = ''
        let sameHits = 0
        for (let i = 0; i < MAX_POLLS; i++) {
            try {
                const [indexRes, metaRes] = await Promise.all([
                    fetch('/', { cache: 'no-store' }),
                    fetch('/node_modules/.vite/deps/_metadata.json', {
                        cache: 'no-store',
                    }),
                ])
                const indexText = await indexRes.text().catch(() => '')
                const metaText = await metaRes.text().catch(() => '')

                const indexOk =
                    indexRes.ok && !indexText.includes('Outdated Optimize Dep')

                let hash = ''
                if (metaRes.ok && metaText.trim()) {
                    try {
                        const meta = JSON.parse(metaText) as {
                            browserHash?: string
                        }
                        hash = meta.browserHash || ''
                    } catch {
                        hash = ''
                    }
                }

                if (indexOk && hash) {
                    if (hash === lastHash) sameHits += 1
                    else {
                        lastHash = hash
                        sameHits = 0
                    }
                    if (sameHits >= 1) return true
                }
            } catch {
                // ignore
            }
            await new Promise((r) => setTimeout(r, POLL_MS))
        }
        return false
    }

    function shouldRecoverForMessage(msg: string) {
        return (
            msg.includes('Outdated Optimize Dep') ||
            msg.includes('Failed to fetch dynamically imported module')
        )
    }

    async function recoverOnce(reason: string) {
        if (getRunning()) return
        if (getCount() >= MAX_RECOVERIES) return

        setRunning(true)
        try {
            // optimizeDeps가 돌아가는 중엔 reload를 바로 때리면 또 같은 504를 맞을 수 있어,
            // "완료 신호"를 기다렸다가 reload합니다.
            const ok = await waitUntilOptimizeDepsReady()
            if (!ok) return
            incCount()

            console.warn(
                `[mf-dev] recovered from optimizeDeps race (${reason})`,
            )
            window.location.reload()
        } finally {
            setRunning(false)
        }
    }

    window.addEventListener('vite:preloadError', () => {
        void recoverOnce('vite:preloadError')
    })

    window.addEventListener(
        'unhandledrejection',
        (e: PromiseRejectionEvent) => {
            const msg = String(e.reason ?? '')
            if (!shouldRecoverForMessage(msg)) return
            void recoverOnce('unhandledrejection')
        },
    )

    window.addEventListener('error', (e: ErrorEvent) => {
        const msg = String(e.message ?? '')
        if (!shouldRecoverForMessage(msg)) return
        void recoverOnce('error')
    })
}
