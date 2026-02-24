/**
 * 메뉴 레이아웃 컴포넌트
 *
 * 애플리케이션의 메뉴를 관리하고 표시하는 레이아웃 컴포넌트입니다.
 * - 메뉴 데이터를 Redux에서 가져와서 표시
 * - 메뉴 초기화 및 로딩 처리
 * - 모달 모듈(평면거리 등) 클릭 시 DSmodal로 마이크로프론트 로드
 */

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Outlet } from 'react-router'
import { shallowEqual, useDispatch } from 'react-redux'
import { DSsideMenu } from '@repo/fe-ui/dssidemenu'
import {
    DSmodal,
    DSmodalContent,
    DSmodalHeader,
    DSmodalTitle,
    DSmodalClose,
    DSmodalBody,
} from '@repo/fe-ui/dsmodal'
import { getRemoteConfigByNameSync } from 'config'
import { menuAction } from 'src/features/menu/menuReducer'
import { RemoteAppLoader } from 'src/remotes/RemoteAppLoader'
import { useAppSelector } from '../store/redux/reduxHooks'
import type { FinalMenuTree } from 'src/features/menu/types/finalMenuTypes'
import { convertToFinalMenu } from 'src/features/menu/utils/converter'
import {
    ModalConstraintProvider,
    useModalConstraint,
} from './ModalConstraintContext'

function isExternalUrl(url: string): boolean {
    return url.startsWith('http')
}

/** kebab-case → PascalCase (예: planar-distance → PlanarDistance) */
function kebabToPascal(kebab: string): string {
    return kebab
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join('')
}

/**
 * 메뉴 url '{remoteName}/{path}' (예: measurement/planar-distance) 해석.
 * - remoteName을 config remotes에서 조회 → base URL (예: http://localhost:12001) 매핑
 * - 그 remote의 {baseUrl}/{path} = http://localhost:12001/planar-distance 에 해당하는 화면을
 *   모듈 페더레이션으로 로드해 보여줌 (path는 kebab→Pascal로 MF expose 경로로 변환).
 */
function parseModalUrl(url: string): {
    remoteName: string
    path: string
    displayName: string
    modulePath: string
} | null {
    const normalized = url?.replace(/^#?\/*|\/*$/g, '') || url
    const parts = normalized.split('/').filter(Boolean)
    if (parts.length < 2) return null
    const [remoteName, ...pathParts] = parts
    const pathSegment = pathParts.join('/')
    const remote = getRemoteConfigByNameSync(remoteName)
    if (!remote) return null
    // remote.url = base (예: http://localhost:12001), path = /planar-distance → MF로 해당 expose 로드
    const exposeName = kebabToPascal(pathSegment)
    const modulePath = `${remoteName}/${exposeName}`
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

const MenuLayout = () => {
    const dispatch = useDispatch()

    const [modalOpen, setModalOpen] = useState(false)
    const [modalModule, setModalModule] = useState<{
        remoteName: string
        path: string
        displayName: string
        modulePath: string
    } | null>(null)

    const handleInternalAction = useCallback((url: string) => {
        // '{remoteName}/{path}' → remotes name 매칭, modalExposes 있으면 모달로 MF 로드
        const moduleInfo = parseModalUrl(url)
        if (moduleInfo) {
            setModalModule(moduleInfo)
            setModalOpen(true)
            return
        }
        if (isExternalUrl(url)) {
            window.open(url, '_blank')
            return
        }
        // TODO: 기타 내부 액션 (actionCode)
    }, [])

    const { baseMenu, baseMenuLoading } = useAppSelector(
        ({ menuReducer }) => ({
            baseMenu: menuReducer.baseMenu.data as FinalMenuTree | null,
            baseMenuLoading: menuReducer.baseMenu.loading,
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
            <DSsideMenu
                menu={finalMenu}
                baseMenuLoading={baseMenuLoading}
                onInternalAction={handleInternalAction}
            >
                <Outlet />
            </DSsideMenu>

            <MenuModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                modalModule={modalModule}
            />
        </ModalConstraintProvider>
    )
}

function MenuModal({
    open,
    onOpenChange,
    modalModule,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    modalModule: {
        remoteName: string
        path: string
        displayName: string
        modulePath: string
    } | null
}) {
    const ctx = useModalConstraint()
    const constraintRef = ctx?.constraintRef

    const modalElement = (
        <DSmodal open={open} onOpenChange={onOpenChange}>
            <DSmodalContent
                className="min-h-[320px] min-w-[480px]"
                constraintRef={constraintRef ?? undefined}
                showOverlay={!constraintRef}
            >
                <DSmodalHeader>
                    <DSmodalTitle>
                        {modalModule?.displayName ?? ''}
                    </DSmodalTitle>
                    <DSmodalClose />
                </DSmodalHeader>
                <DSmodalBody>
                    {modalModule ? (
                        <RemoteAppLoader
                            config={{
                                id:
                                    modalModule.remoteName +
                                    '-' +
                                    modalModule.path,
                                name: modalModule.displayName,
                                modulePath: modalModule.modulePath,
                            }}
                            fallback={
                                <ModalLoadingFallback
                                    displayName={modalModule.displayName}
                                    remoteName={modalModule.remoteName}
                                />
                            }
                            errorFallback={
                                <ModalErrorFallback
                                    remoteName={modalModule.remoteName}
                                />
                            }
                        />
                    ) : null}
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
