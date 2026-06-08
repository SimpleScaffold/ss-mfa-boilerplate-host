import React from 'react'
import ReactDOM from 'react-dom/client'

/**
 * Remote 앱이 yarn dev로 로드될 때 단일 React 인스턴스 사용 (shared-deps에서 참조)
 */
export function setupSharedReact() {
    if (typeof window === 'undefined') return

    const win = window as Window & {
        __SHARED_REACT__?: typeof React
        __SHARED_REACT_DOM__?: typeof ReactDOM
    }
    win.__SHARED_REACT__ = React
    win.__SHARED_REACT_DOM__ = ReactDOM
}
