import createSagaMiddleware from 'redux-saga'
import { configureStore, Tuple } from '@reduxjs/toolkit'
import { all } from 'redux-saga/effects'
import { routerSaga, routerSlice } from 'src/globals/router/routerReducer.tsx'
import { sampleSaga, sampleSlice } from 'src/features/sample/sampleReducer'
import { themeSlice } from 'src/globals/theme/themeReducer.tsx'
import { cesiumSaga, cesiumSlice } from 'src/globals/cesium/store/cesiumReducer'
import { menuSaga, menuSlice } from 'src/features/menu/menuReducer'

const reducers = {
    routerReducer: routerSlice.reducer,
    sampleReducer: sampleSlice.reducer,
    themeReducer: themeSlice.reducer,
    cesiumReducer: cesiumSlice.reducer,
    menuReducer: menuSlice.reducer,
}

export function* rootSaga() {
    yield all([sampleSaga(), routerSaga(), cesiumSaga(), menuSaga()])
}

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
    reducer: reducers,
    middleware: () => new Tuple(sagaMiddleware),
    devTools: process.env.NODE_ENV !== 'production', //보여지는지 여부
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

sagaMiddleware.run(rootSaga)
export default store
