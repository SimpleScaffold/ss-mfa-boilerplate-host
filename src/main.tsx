import { createRoot } from 'react-dom/client'
import App from 'src/App'
import { Provider } from 'react-redux'
import store from 'src/globals/store/redux/reduxStore.tsx'

import '@repo/fe-ui/styles'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>,
)
