import { reduxMaker } from 'src/globals/store/redux/reduxUtils.ts'
import { PayloadAction } from '@reduxjs/toolkit'

const prefix = 'router'

const asyncRequests = [] as const

const historyState = window.history.state as { usr?: unknown } | null
const localState = {
    location: {
        path: window.location.pathname || null,
        state: historyState?.usr ?? null,
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
