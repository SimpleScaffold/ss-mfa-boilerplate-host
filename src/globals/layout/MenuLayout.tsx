/**
 * 메뉴 레이아웃 컴포넌트
 *
 * 애플리케이션의 메뉴를 관리하고 표시하는 레이아웃 컴포넌트입니다.
 * - 메뉴 데이터를 Redux에서 가져와서 표시
 * - 메뉴 초기화 및 로딩 처리
 */

import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { shallowEqual, useDispatch } from 'react-redux'
import { DSlayout } from '@repo/fe-ui/dslayout'

import { menuAction } from 'src/features/menu/menuReducer'
import { useAppSelector } from '../store/redux/reduxHooks'
import type { FinalMenuTree } from 'src/features/menu/types/finalMenuTypes'
import { convertToFinalMenu } from 'src/features/menu/utils/converter'

const MenuLayout = () => {
    const dispatch = useDispatch()

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
        setFinalMenu(convertToFinalMenu(baseMenu as FinalMenuTree | null))
    }, [baseMenu])

    return (
        <DSlayout
            menuType="side"
            menu={finalMenu}
            baseMenuLoading={baseMenuLoading}
        >
            <Outlet />
        </DSlayout>
    )
}

export default MenuLayout
