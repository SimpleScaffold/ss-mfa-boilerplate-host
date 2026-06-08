/// <reference types="vite/client" />

import { createBrowserRouter, RouteObject } from 'react-router'
import React, { Suspense, lazy } from 'react'
import type { ComponentType } from 'react'
import NotFoundPage from 'src/pages/extra/NotFoundPage.tsx'
import MenuLayout from 'src/globals/layout/MenuLayout'

type RouteModule = { default: ComponentType }

// HomePage lazy load로 초기 번들 분리
const HomePage = lazy(() => import('src/pages/HomePage'))

const MODULES = import.meta.glob<RouteModule>('src/pages/url/**/*.tsx')

const generateRoutes = (
    modules: Record<string, () => Promise<RouteModule>>,
): RouteObject[] => {
    return Object.entries(modules).map(([path, loadModule]) => {
        const routePath = path
            .replace(/.*src\/pages\/url\//, '')
            .replace(/\.tsx$/, '')
            .replace(/Page$/, '')
            .replace(/\[(.*?)]/g, ':$1')
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
                element: (
                    <Suspense fallback={null}>
                        <HomePage />
                    </Suspense>
                ),
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
