/**
 * 메뉴 레이아웃 컴포넌트
 *
 * 애플리케이션의 메뉴를 관리하고 표시하는 레이아웃 컴포넌트입니다.
 * - 메뉴 데이터를 Redux에서 가져와서 표시
 * - 메뉴 초기화 및 로딩 처리
 * - 모달 모듈(평면거리 등) 클릭 시 DSmodal로 마이크로프론트 로드
 */

import { useCallback, useEffect, useState } from 'react'
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
import { getModalModuleMap, getRemoteConfigByName } from 'config'
import { menuAction } from 'src/features/menu/menuReducer'
import { useAppSelector } from '../store/redux/reduxHooks'
import type { FinalMenuTree } from 'src/features/menu/types/finalMenuTypes'
import { convertToFinalMenu } from 'src/features/menu/utils/converter'

function isExternalUrl(url: string): boolean {
    return url.startsWith('http')
}

const MenuLayout = () => {
    const dispatch = useDispatch()
    const modalModuleMap = getModalModuleMap()

    const [modalOpen, setModalOpen] = useState(false)
    const [modalModule, setModalModule] = useState<{
        remoteName: string
        path: string
        displayName: string
    } | null>(null)

    const handleInternalAction = useCallback(
        (url: string) => {
            // 모달로 열리는 마이크로프론트 모듈
            const moduleInfo = modalModuleMap[url]
            if (moduleInfo) {
                setModalModule(moduleInfo)
                setModalOpen(true)
                return
            }
            // 외부 URL
            if (isExternalUrl(url)) {
                window.open(url, '_blank')
                return
            }
            // TODO: 기타 내부 액션 (actionCode)
        },
        [modalModuleMap],
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
        // 메뉴 불러오기
        dispatch(menuAction.getBaseMenu(undefined))
    }, [dispatch])

    // 메뉴 데이터가 로드되면 메뉴 타입을 최종 메뉴 타입으로 변환
    useEffect(() => {
        setFinalMenu(convertToFinalMenu(baseMenu))
    }, [baseMenu])

    return (
        <>
            <DSsideMenu
                menu={finalMenu}
                baseMenuLoading={baseMenuLoading}
                onInternalAction={handleInternalAction}
            >
                <Outlet />
            </DSsideMenu>

            <DSmodal open={modalOpen} onOpenChange={setModalOpen}>
                <DSmodalContent className="min-h-[320px] min-w-[480px]">
                    <DSmodalHeader>
                        <DSmodalTitle>
                            {modalModule?.displayName ?? ''}
                        </DSmodalTitle>
                        <DSmodalClose />
                    </DSmodalHeader>
                    <DSmodalBody>
                        {modalModule &&
                            (() => {
                                const remote = getRemoteConfigByName(
                                    modalModule.remoteName,
                                )
                                const src = remote?.origin
                                    ? `${remote.origin}${modalModule.path}`
                                    : ''
                                return src ? (
                                    <iframe
                                        src={src}
                                        title={modalModule.displayName}
                                        className="min-h-[280px] w-full min-w-0 rounded border-0"
                                    />
                                ) : null
                            })()}
                    </DSmodalBody>
                </DSmodalContent>
            </DSmodal>
        </>
    )
}

export default MenuLayout
