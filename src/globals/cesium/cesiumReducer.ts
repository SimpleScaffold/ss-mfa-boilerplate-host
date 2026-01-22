import { PayloadAction } from '@reduxjs/toolkit'
import { reduxMaker } from 'src/globals/store/redux/reduxUtils.ts'

const prefix = 'cesium'

const localState = {
    isInitialized: false,
    isLoading: false,
    error: null as string | null,
}

const localReducers = {
    setInitialized: (state: typeof localState, action: PayloadAction<boolean>) => {
        state.isInitialized = action.payload
    },
    setLoading: (state: typeof localState, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload
    },
    setError: (state: typeof localState, action: PayloadAction<string | null>) => {
        state.error = action.payload
    },
    reset: (state: typeof localState) => {
        state.isInitialized = false
        state.isLoading = false
        state.error = null
    },
}

const module = reduxMaker(prefix, [], localState, localReducers)

export const {
    slice: cesiumSlice,
    actions: cesiumAction,
    saga: cesiumSaga,
} = module
