import { AsyncRequest, reduxMaker } from 'src/globals/store/redux/reduxUtils'
import { getBaseMenu } from './menuAPI'
import type { FinalMenuTree } from './types/finalMenuTypes'

const prefix = 'menu'

const asyncRequests = [
    {
        action: 'getBaseMenu',
        state: 'baseMenu',
        initialState: null as FinalMenuTree | null,
        api: getBaseMenu,
    } as const satisfies AsyncRequest<FinalMenuTree | null, void>,
] as const

const localState = {}

const localReducers = {}

const module = reduxMaker(prefix, asyncRequests, localState, localReducers)
export const { slice: menuSlice, actions: menuAction, saga: menuSaga } = module
