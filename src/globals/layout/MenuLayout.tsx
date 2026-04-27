/**
 * 메뉴 레이아웃 컴포넌트
 *
 * 애플리케이션의 메뉴를 관리하고 표시하는 레이아웃 컴포넌트입니다.
 * - 메뉴 데이터를 Redux에서 가져와서 표시
 * - 메뉴 초기화 및 로딩 처리
 * - 모달 모듈(평면거리 등) 클릭 시 DSmodal로 마이크로프론트 로드
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Outlet } from 'react-router'
import { shallowEqual, useDispatch } from 'react-redux'
import { DSsideMenu } from '@repo/packages/fe-ui/dssidemenu'
import {
    DSmodal,
    DSmodalBody,
    DSmodalClose,
    DSmodalContent,
    DSmodalHeader,
    DSmodalTitle,
} from '@repo/packages/fe-ui/dsmodal'
import type { ModalInitialPosition } from '@repo/packages/fe-utils/modal/modalInitialPosition'
import { getRemoteConfigByNameSync } from 'config'
import { loadRemoteModule } from 'virtual:mf-remote-imports'
import { menuAction } from 'src/features/menu/menuReducer'
import { RemoteAppLoader } from 'src/globals/remotes/RemoteAppLoader'
import { useAppSelector } from '../store/redux/reduxHooks'
import type { FinalMenuTree } from 'src/features/menu/types/finalMenuTypes'
import { convertToFinalMenu } from 'src/features/menu/utils/converter'
import {
    MapToolBridgeProvider,
    useMapToolBridgeApi,
} from 'measurement/MapToolBridge'
import { HostThemeSettingsDrawer } from 'src/globals/theme/HostThemeSettingsDrawer.tsx'
import {
    ModalConstraintProvider,
    useModalConstraint,
} from './ModalConstraintContext'

function isExternalUrl(url: string): boolean {
    return url.startsWith('http')
}

export type ModalModuleInfo = {
    remoteName: string
    path: string
    displayName: string
    modulePath: string
}

/**
 * 메뉴 url '{remoteName}/{path}' (예: measurement/planar-distance) 해석.
 * - remoteName을 config remotes에서 조회 → base URL (예: http://localhost:12001) 매핑
 * - 그 remote의 {baseUrl}/{path} = http://localhost:12001/planar-distance 에 해당하는 화면을
 *   모듈 페더레이션으로 로드해 보여줌 (`modulePath`는 메뉴 url과 동일하게 kebab, 예: measurement/planar-distance).
 */
/** getModalEntries 원격 반환 — 타입만 고정(런타임은 Remote가 책임) */
type RemoteModalExpansionEntry = {
    url: string
    displayName: string
    initialPosition?: ModalInitialPosition
    initialSize?: { width: number; height: number }
    props?: Record<string, unknown>
    deferOpen?: boolean
    deferralSignal?: string
}

function parseModalUrl(url: string): ModalModuleInfo | null {
    const normalized = url?.replace(/^#?\/*|\/*$/g, '') || url
    const parts = normalized.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const [remoteName, ...pathParts] = parts
    const pathSegment = pathParts.join('/')
    const remote = getRemoteConfigByNameSync(remoteName)
    if (!remote) return null
    // remote.url = base (예: http://localhost:12001), path = /planar-distance → MF expose `./planar-distance`
    const modulePath = `${remoteName}/${pathSegment}`
    const displayName = pathSegment
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    return {
        remoteName,
        path: '/' + pathSegment,
        displayName,
        modulePath,
    }
}

/** 모달 내 원격 앱 로딩 중 폴백. 10초 후 원격 앱 실행 안내 표시 */
function ModalLoadingFallback({
    displayName,
    remoteName,
}: {
    displayName: string
    remoteName: string
}) {
    const [showHint, setShowHint] = useState(false)
    useEffect(() => {
        const t = window.setTimeout(() => setShowHint(true), 10_000)
        return () => clearTimeout(t)
    }, [])
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-2">
            <span>{displayName} 로딩 중...</span>
            {showHint && (
                <span className="text-xs text-gray-500">
                    오래 걸리면 <strong>{remoteName}</strong> 앱이 실행 중인지
                    확인하세요 (yarn dev).
                </span>
            )}
        </div>
    )
}

/** 모달 내 원격 앱 로드 실패 시 안내 */
function ModalErrorFallback({ remoteName }: { remoteName: string }) {
    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <h3 className="mb-2 text-lg font-semibold text-red-800">
                원격 앱 로딩 실패
            </h3>
            <p className="text-sm text-red-600">
                <strong>{remoteName}</strong> 앱이 실행 중인지 확인하세요.
                로컬에서는{' '}
                <code className="rounded bg-red-100 px-1">yarn dev</code>로
                host와 remote를 함께 띄워야 합니다.
            </p>
        </div>
    )
}

type OpenModalItem = {
    id: string
    /** Host에서 모달 초기 위치. 없으면 (0,0) */
    initialPosition?: ModalInitialPosition
    /** Host에서 모달 초기 크기 제어. px 단위. 없으면 기본값(420x360) */
    initialSize?: { width: number; height: number }
    /** Remote 컴포넌트에 전달할 props (id 등 분기용) */
    modalProps?: Record<string, unknown>
    /** true면 `deferralSignal` 이벤트 수신 전까지 시트를 열지 않음 */
    deferOpen?: boolean
    deferralSignal?: string
} & ModalModuleInfo

/**
 * 동일 원격 모듈·동일 `modalId` 조합은 하나만 유지 (메뉴 재클릭·연속 측정 이벤트 중복 방지).
 * `modalId` 없으면 `modulePath`만으로 구분.
 */
function modalInstanceKey(
    item: Pick<OpenModalItem, 'modulePath' | 'modalProps'>,
): string {
    const raw = item.modalProps?.modalId
    const modalId = typeof raw === 'string' ? raw : ''
    return `${item.modulePath}::${modalId}`
}

/** terrain-analysis 등 Remote와 문자열 동기화 */
const DEFERRED_MODAL_OPEN_EVENT = 'micro-platform:open-deferred-modal'

function computeModalSheetOpen(
    item: OpenModalItem,
    deferredReadyBySignal: Record<string, boolean>,
): boolean {
    if (!item.deferOpen || !item.deferralSignal) return true
    return deferredReadyBySignal[item.deferralSignal] === true
}

const MenuLayout = () => {
    const dispatch = useDispatch()

    const [openModals, setOpenModals] = useState<OpenModalItem[]>([])
    const [deferredModalReadyBySignal, setDeferredModalReadyBySignal] =
        useState<Record<string, boolean>>({})
    const deferredModalTemplatesRef = useRef<Map<string, OpenModalItem>>(
        new Map(),
    )

    useEffect(() => {
        const onDeferredOpen = (e: Event): void => {
            const ce = e as CustomEvent<{ signalId?: string }>
            const signalId =
                ce.detail && typeof ce.detail.signalId === 'string'
                    ? ce.detail.signalId
                    : undefined
            if (!signalId) return
            setDeferredModalReadyBySignal((prev) => ({
                ...prev,
                [signalId]: true,
            }))
            setOpenModals((prev) => {
                if (prev.some((m) => m.deferralSignal === signalId)) {
                    return prev
                }
                const tmpl = deferredModalTemplatesRef.current.get(signalId)
                if (!tmpl) return prev
                const tmplKey = modalInstanceKey(tmpl)
                if (prev.some((m) => modalInstanceKey(m) === tmplKey)) {
                    return prev
                }
                return [
                    ...prev,
                    {
                        ...tmpl,
                        id: `modal-${Date.now()}-deferred`,
                        deferOpen: false,
                        deferralSignal: undefined,
                    },
                ]
            })
        }
        window.addEventListener(
            DEFERRED_MODAL_OPEN_EVENT,
            onDeferredOpen as EventListener,
        )
        return () => {
            window.removeEventListener(
                DEFERRED_MODAL_OPEN_EVENT,
                onDeferredOpen as EventListener,
            )
        }
    }, [])

    const handleInternalAction = useCallback((url: string) => {
        // '{remoteName}/{path}' → remotes name 매칭, modalExposes 있으면 모달로 MF 로드
        const moduleInfo = parseModalUrl(url)
        if (moduleInfo) {
            const normalized = url.replace(/^#?\/*|\/*$/g, '')
            const parts = normalized.split('/').filter(Boolean)
            const remoteName = parts[0]
            const path = parts.slice(1).join('/')
            const expansionPath = `${remoteName}/ModalExpansions`

            const openSingleModal = () =>
                setOpenModals((prev) => [
                    ...prev,
                    { id: `modal-${Date.now()}`, ...moduleInfo },
                ])

            // Remote에 ModalExpansions가 있으면 getModalEntries로 열 개수/설정 조회
            loadRemoteModule(expansionPath)
                .then((mod: unknown) => {
                    const m = mod as {
                        getModalEntries?: (
                            r: string,
                            p: string,
                        ) => RemoteModalExpansionEntry[] | null
                    }
                    const entries: RemoteModalExpansionEntry[] | null =
                        typeof m?.getModalEntries === 'function'
                            ? (m.getModalEntries(remoteName, path) ?? null)
                            : null
                    if (entries && entries.length > 0) {
                        const signalsToReset = entries
                            .filter(
                                (
                                    o,
                                ): o is RemoteModalExpansionEntry & {
                                    deferralSignal: string
                                } => Boolean(o.deferOpen && o.deferralSignal),
                            )
                            .map((o) => o.deferralSignal)
                        if (signalsToReset.length > 0) {
                            setDeferredModalReadyBySignal((s) => {
                                const next = { ...s }
                                for (const sig of signalsToReset) {
                                    next[sig] = false
                                }
                                return next
                            })
                        }
                        setOpenModals((prev) => {
                            const incoming = entries.flatMap((opt, i) => {
                                const info = parseModalUrl(opt.url)
                                if (!info) return []
                                const item: OpenModalItem = {
                                    id: `modal-${Date.now()}-${i}`,
                                    ...info,
                                    displayName: opt.displayName,
                                    initialPosition: opt.initialPosition,
                                    initialSize: opt.initialSize,
                                    modalProps: opt.props,
                                    deferOpen: opt.deferOpen,
                                    deferralSignal: opt.deferralSignal,
                                }
                                if (opt.deferOpen && opt.deferralSignal) {
                                    deferredModalTemplatesRef.current.set(
                                        opt.deferralSignal,
                                        item,
                                    )
                                }
                                return [item]
                            })
                            const incomingKeys = new Set(
                                incoming.map((m) => modalInstanceKey(m)),
                            )
                            const withoutReplaced = prev.filter(
                                (m) => !incomingKeys.has(modalInstanceKey(m)),
                            )
                            return [...withoutReplaced, ...incoming]
                        })
                    } else {
                        openSingleModal()
                    }
                })
                .catch(() => openSingleModal())
            return
        }
        if (isExternalUrl(url)) {
            window.open(url, '_blank')
            return
        }
        // TODO: 기타 내부 액션 (actionCode)
    }, [])

    const { baseMenu } = useAppSelector(
        ({ menuReducer }) => ({
            baseMenu: menuReducer.baseMenu.data as FinalMenuTree | null,
        }),
        shallowEqual,
    )

    const [finalMenu, setFinalMenu] = useState<FinalMenuTree>([])

    useEffect(() => {
        // 메뉴 불러오기
        dispatch(menuAction.getBaseMenu(undefined))
    }, [dispatch])

    // 메뉴 데이터가 로드되면 메뉴 타입을 최종 메뉴 타입으로 변환
    useEffect(() => {
        setFinalMenu(convertToFinalMenu(baseMenu))
    }, [baseMenu])

    return (
        <ModalConstraintProvider>
            <MapToolBridgeProvider>
                <DSsideMenu
                    menu={finalMenu}
                    onInternalAction={handleInternalAction}
                    headerTrailing={
                        <>
                            <HostThemeSettingsDrawer />
                        </>
                    }
                >
                    <Outlet />
                </DSsideMenu>

                {openModals.map((item) => (
                    <MenuModal
                        key={item.id}
                        open={computeModalSheetOpen(
                            item,
                            deferredModalReadyBySignal,
                        )}
                        onOpenChange={(open) => {
                            if (!open) {
                                setOpenModals((prev) =>
                                    prev.filter((m) => m.id !== item.id),
                                )
                            }
                        }}
                        modalItem={item}
                    />
                ))}
            </MapToolBridgeProvider>
        </ModalConstraintProvider>
    )
}

function MenuModal({
    open,
    onOpenChange,
    modalItem,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    modalItem: OpenModalItem
}) {
    const ctx = useModalConstraint()
    const constraintRef = ctx?.constraintRef
    const mapToolApi = useMapToolBridgeApi()

    const remoteProps = useMemo(() => {
        const base = modalItem.modalProps ?? {}
        if (!mapToolApi) return base
        return { ...base, mapToolBridge: mapToolApi }
    }, [modalItem.modalProps, mapToolApi])

    // 참조 안정화: 새 모달이 열릴 때 부모 리렌더로 인해 fallback/errorFallback이
    // 매번 새로 생성되면 RemoteAppLoader의 useMemo가 무효화되어 기존 열린 모달들까지
    // 리로드되는 문제를 방지합니다.
    const fallback = useMemo(
        () => (
            <ModalLoadingFallback
                displayName={modalItem.displayName}
                remoteName={modalItem.remoteName}
            />
        ),
        [modalItem.displayName, modalItem.remoteName],
    )
    const errorFallback = useMemo(
        () => <ModalErrorFallback remoteName={modalItem.remoteName} />,
        [modalItem.remoteName],
    )

    const modalElement = (
        <DSmodal open={open} onOpenChange={onOpenChange}>
            <DSmodalContent
                className="min-h-[320px] min-w-[480px]"
                constraintRef={constraintRef ?? undefined}
                showOverlay={!constraintRef}
                initialPosition={modalItem.initialPosition}
                initialSize={modalItem.initialSize}
            >
                <DSmodalHeader>
                    <DSmodalTitle>{modalItem.displayName}</DSmodalTitle>
                    <DSmodalClose />
                </DSmodalHeader>
                <DSmodalBody>
                    <RemoteAppLoader
                        config={{
                            id: modalItem.id,
                            name: modalItem.displayName,
                            modulePath: modalItem.modulePath,
                        }}
                        props={remoteProps}
                        fallback={fallback}
                        errorFallback={errorFallback}
                    />
                </DSmodalBody>
            </DSmodalContent>
        </DSmodal>
    )

    // constraintRef 내부에 포탈하여 모달이 지도 영역에 국한되도록 함
    if (constraintRef?.current) {
        return createPortal(modalElement, constraintRef.current)
    }
    return modalElement
}

export default MenuLayout
