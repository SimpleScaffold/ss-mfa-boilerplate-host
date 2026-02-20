/**
 * 메뉴 레이아웃 컴포넌트
 *
 * 애플리케이션의 메뉴를 관리하고 표시하는 레이아웃 컴포넌트입니다.
 * - 메뉴 데이터를 Redux에서 가져와서 표시
 * - 모달 모듈 클릭 시 Module Federation으로 Remote 컴포넌트 동적 로드
 * - Remote에서 addModal 요청 시 추가 모달 동적 생성 (postMessage)
 */

import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
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
import { MSG_HOST_READY } from '@repo/mf-modal-protocol'
import { getRemoteConfigByNameSync, parseModalUrl } from 'config'
import { menuAction } from 'src/features/menu/menuReducer'
import { useAppSelector } from '../store/redux/reduxHooks'
import type { FinalMenuTree } from 'src/features/menu/types/finalMenuTypes'
import { convertToFinalMenu } from 'src/features/menu/utils/converter'
import { useHostModalManager } from 'src/features/modal/useHostModalManager'
import {
    ModalConstraintProvider,
    useModalConstraint,
} from './ModalConstraintContext'

function isExternalUrl(url: string): boolean {
    return url.startsWith('http')
}

/** remoteName → ModalContent lazy import (Module Federation) */
const MODAL_CONTENT_LOADERS: Record<
    string,
    () => Promise<{ default: (props: { path: string }) => React.ReactNode }>
> = {
    measurement: () => import('measurement/ModalContent'),
}

const MenuLayout = () => {
    const dispatch = useDispatch()
    const { openModal, closeModal, modals } = useHostModalManager()

    const handleInternalAction = useCallback(
        (url: string, displayName?: string) => {
            // 외부 URL
            if (isExternalUrl(url)) {
                window.open(url, '_blank')
                return
            }
            // 모달: url 형식 {remoteName}/{path} (예: measurement/planar-distance)
            // remotes에서 remoteName 조회
            const parsed = parseModalUrl(url)
            if (parsed) {
                const remote = getRemoteConfigByNameSync(parsed.remoteName)
                if (remote?.origin) {
                    openModal({
                        remoteName: parsed.remoteName,
                        path: parsed.path,
                        displayName:
                            displayName ?? remote.displayName ?? parsed.path,
                    })
                    return
                }
            }
            // TODO: 기타 내부 액션 (actionCode)
        },
        [openModal],
    )

    const { baseMenu, baseMenuLoading } = useAppSelector(
        ({ menuReducer }) => ({
            baseMenu: menuReducer.baseMenu.data as FinalMenuTree | null,
            baseMenuLoading: menuReducer.baseMenu.loading,
        }),
        shallowEqual,
    )

    const [finalMenu, setFinalMenu] = useState<FinalMenuTree>([])

    useEffect(() => {
        dispatch(menuAction.getBaseMenu(undefined))
    }, [dispatch])

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

            {modals.map((modal) => (
                <MenuModal
                    key={modal.id}
                    modal={modal}
                    onClose={() => closeModal(modal.id)}
                    onOpenChange={(open) => !open && closeModal(modal.id)}
                />
            ))}
        </ModalConstraintProvider>
    )
}

interface MenuModalProps {
    modal: {
        id: string
        remoteName: string
        path: string
        displayName: string
        width?: number
        height?: number
        x?: number
        y?: number
        open: boolean
    }
    onClose: () => void
    onOpenChange: (open: boolean) => void
}

function RemoteModalContent({
    remoteName,
    path,
}: {
    remoteName: string
    path: string
}) {
    const [Component, setComponent] = useState<
        ((p: { path: string }) => React.ReactNode) | null
    >(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const load = MODAL_CONTENT_LOADERS[remoteName]
        if (!load) {
            setError(new Error(`Unknown modal remote: ${remoteName}`))
            return
        }
        load()
            .then((m) => setComponent(() => m.default))
            .catch(setError)
    }, [remoteName])

    if (error)
        return (
            <div className="p-4 text-red-600">로드 실패: {error.message}</div>
        )
    if (!Component)
        return (
            <div className="flex min-h-[280px] items-center justify-center p-4">
                로딩 중...
            </div>
        )
    return <Component path={path} />
}

function MenuModal({ modal, onClose, onOpenChange }: MenuModalProps) {
    const ctx = useModalConstraint()
    const constraintRef = ctx?.constraintRef

    // MF 로드 시 Remote(useHostModalApi)에 Host 준비 메시지 전송 (addModal 가능)
    useEffect(() => {
        if (!modal.open) return
        const t = setTimeout(() => {
            window.postMessage({ type: MSG_HOST_READY }, '*')
        }, 100)
        return () => clearTimeout(t)
    }, [modal.open, modal.id])

    const modalElement = (
        <DSmodal open={modal.open} onOpenChange={onOpenChange}>
            <DSmodalContent
                className="min-h-[320px] min-w-[480px]"
                constraintRef={constraintRef ?? undefined}
                showOverlay={!constraintRef}
                initialSize={
                    modal.width != null && modal.height != null
                        ? { width: modal.width, height: modal.height }
                        : undefined
                }
                initialPosition={
                    modal.x != null && modal.y != null
                        ? { x: modal.x, y: modal.y }
                        : undefined
                }
            >
                <DSmodalHeader>
                    <DSmodalTitle>{modal.displayName}</DSmodalTitle>
                    <DSmodalClose />
                </DSmodalHeader>
                <DSmodalBody>
                    <Suspense
                        fallback={
                            <div className="flex min-h-[280px] items-center justify-center p-4">
                                로딩 중...
                            </div>
                        }
                    >
                        <RemoteModalContent
                            remoteName={modal.remoteName}
                            path={modal.path}
                        />
                    </Suspense>
                </DSmodalBody>
            </DSmodalContent>
        </DSmodal>
    )

    if (constraintRef?.current) {
        return createPortal(modalElement, constraintRef.current)
    }
    return modalElement
}

export default MenuLayout
