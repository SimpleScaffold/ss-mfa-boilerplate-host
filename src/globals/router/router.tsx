import { createBrowserRouter, RouteObject } from 'react-router'
import HomePage from 'src/pages/HomePage'
import React, { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import NotFoundPage from 'src/pages/extra/NotFoundPage.tsx'
import MenuLayout from 'src/globals/layout/MenuLayout'

// NOTE: https://reactrouter.com/start/data/routing
// TODO: lazy loading 적용해야 할까? > 필요 없을거 같음

type RouteModule = { default: ComponentType }

const MODULES = import.meta.glob<RouteModule>('src/pages/url/**/*.tsx')

const generateRoutes = (
    modules: Record<string, () => Promise<RouteModule>>,
): RouteObject[] => {
    return Object.entries(modules).map(([path, loadModule]) => {
        // 파일 경로에서 'src/pages/url/' 이후의 경로를 추출
        const routePath = path
            .replace(/.*src\/pages\/url\//, '') // 'src/pages/url/' 부분 제거
            .replace(/\.tsx$/, '') // 확장자 제거
            .replace(/Page$/, '') // 'Page' 접미사 제거
            .replace(/\[(.*?)]/g, ':$1') // [param] -> :param 변환
            .toLowerCase()

        const LazyComponent = lazy(loadModule)

        return {
            path: `/${routePath}`,
            element: (
                <Suspense fallback={null}>
                    <LazyComponent />
                </Suspense>
            ),
        }
    })
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <MenuLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            ...generateRoutes(MODULES),
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
])

export default router
