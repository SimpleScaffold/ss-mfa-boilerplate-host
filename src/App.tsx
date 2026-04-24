import { RouterProvider } from 'react-router'
import { Bounce, ToastContainer } from 'react-toastify'

import router from 'src/globals/router/router.tsx'
import useRouteListener from 'src/globals/router/useRouteListener.tsx'
import { ThemeProvider, useTheme } from 'src/globals/theme/theme-provider.tsx'
import { usePreloadCleanup } from 'src/globals/theme/usePreloadCleanup.tsx'

function ThemedToastContainer() {
    const { theme } = useTheme()

    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme === 'dark' ? 'dark' : 'light'}
            transition={Bounce}
        />
    )
}

function App() {
    useRouteListener()
    usePreloadCleanup()

    return (
        <ThemeProvider>
            <RouterProvider router={router} />
            <ThemedToastContainer />
        </ThemeProvider>
    )
}

export default App
