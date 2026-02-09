import { useLayoutEffect, useState } from 'react'
import { useAppDispatch } from 'src/globals/store/redux/reduxHooks.tsx'
import { routerAction } from 'src/globals/router/routerReducer.tsx'

const useRouteListener = () => {
    const dispatch = useAppDispatch()

    const [route, setRoute] = useState({
        path: window.location.pathname || null,
        state: window.history.state?.usr || null,
    })

    useLayoutEffect(() => {
        // 원래 함수를 저장 (bind를 사용하여 this 컨텍스트 보존)
        const originalPushState = (
            ...args: Parameters<typeof window.history.pushState>
        ) => {
            return window.history.pushState(...args)
        }
        const originalReplaceState = (
            ...args: Parameters<typeof window.history.replaceState>
        ) => {
            return window.history.replaceState(...args)
        }

        const handleStateChange = (
            method: typeof originalPushState,
            ...args: Parameters<typeof originalPushState>
        ) => {
            const event = new CustomEvent('locationChange')
            method(...args)
            window.dispatchEvent(event)
        }

        window.history.pushState = (...args) =>
            handleStateChange(originalPushState, ...args)
        window.history.replaceState = (...args) =>
            handleStateChange(originalReplaceState, ...args)

        const handleLocationChange = () => {
            setRoute({
                path: window.location.pathname || null,
                state: window.history.state?.usr || null,
            })
        }

        window.addEventListener('locationChange', handleLocationChange)
        window.addEventListener('popstate', handleLocationChange)

        return () => {
            // 원래 함수로 복원
            window.history.pushState = originalPushState
            window.history.replaceState = originalReplaceState
            window.removeEventListener('locationChange', handleLocationChange)
            window.removeEventListener('popstate', handleLocationChange)
        }
    }, [])

    useLayoutEffect(() => {
        dispatch(routerAction.locationChange(route))
    }, [route, dispatch])
}

export default useRouteListener
