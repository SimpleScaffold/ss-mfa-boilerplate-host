import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import App from 'src/App'
import store from 'src/globals/store/redux/reduxStore.tsx'
import { setupSharedReact } from 'src/globals/dev/setupSharedReact'
import { setupViteFirstLoadRecovery } from 'src/globals/dev/setupViteFirstLoadRecovery'

import '@repo/packages/fe-ui/styles'

setupSharedReact()

if (import.meta.env.DEV) {
    setupViteFirstLoadRecovery()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>,
)
