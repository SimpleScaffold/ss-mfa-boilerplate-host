import { reduxMaker } from 'src/globals/store/redux/reduxUtils.ts'
import { PayloadAction } from '@reduxjs/toolkit'

const prefix = 'router'

const asyncRequests = [] as const

const getHistoryState = (): unknown => {
    const s = window.history.state as unknown
    if (typeof s === 'object' && s !== null && 'usr' in s) {
        return (s as { usr: unknown }).usr
    }
    return null
}

const localState = {
    location: {
        path: window.location.pathname || null,
        state: getHistoryState(),
    },
}

const localReducers = {
    locationChange: (
        state: typeof localState,
        action: PayloadAction<{
            path: string
            state: unknown
        }>,
    ) => {
        return {
            ...state,
            location: action.payload,
        }
    },
}

const module = reduxMaker(prefix, asyncRequests, localState, localReducers)
export const {
    slice: routerSlice,
    actions: routerAction,
    saga: routerSaga,
} = module
