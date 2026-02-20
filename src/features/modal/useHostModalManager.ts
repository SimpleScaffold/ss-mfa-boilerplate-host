/**
 * Host 모달 매니저 - 다중 모달 관리 + Remote addModal 요청 처리
 */

import { useCallback, useEffect, useState } from 'react'
import {
    MSG_HOST_ADD_MODAL,
    type AddModalSpec,
    type HostAddModalMessage,
} from '@repo/mf-modal-protocol'
import { getRemoteConfigByNameSync } from 'config'

export interface ModalItem {
    id: string
    remoteName: string
    path: string
    displayName: string
    width?: number
    height?: number
    x?: number
    y?: number
    open: boolean
}

function generateId(): string {
    return `modal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface UseHostModalManagerReturn {
    modals: ModalItem[]
    openModal: (spec: {
        remoteName: string
        path: string
        displayName: string
        width?: number
        height?: number
        x?: number
        y?: number
    }) => string
    closeModal: (id: string) => void
    closeAllModals: () => void
}

export function useHostModalManager(): UseHostModalManagerReturn {
    const [modals, setModals] = useState<ModalItem[]>([])

    const openModal = useCallback(
        (spec: {
            remoteName: string
            path: string
            displayName: string
            width?: number
            height?: number
            x?: number
            y?: number
        }) => {
            const id = generateId()
            setModals((prev) => [
                ...prev,
                {
                    id,
                    remoteName: spec.remoteName,
                    path: spec.path,
                    displayName: spec.displayName,
                    width: spec.width,
                    height: spec.height,
                    x: spec.x,
                    y: spec.y,
                    open: true,
                },
            ])
            return id
        },
        [],
    )

    const closeModal = useCallback((id: string) => {
        setModals((prev) =>
            prev.map((m) => (m.id === id ? { ...m, open: false } : m)),
        )
        // 애니메이션 후 제거
        setTimeout(() => {
            setModals((prev) => prev.filter((m) => m.id !== id))
        }, 200)
    }, [])

    const closeAllModals = useCallback(() => {
        setModals((prev) => prev.map((m) => ({ ...m, open: false })))
        setTimeout(() => setModals([]), 200)
    }, [])

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            const data = e.data as unknown
            if (
                typeof data === 'object' &&
                data !== null &&
                'type' in data &&
                (data as HostAddModalMessage).type === MSG_HOST_ADD_MODAL &&
                'payload' in data
            ) {
                const { payload } = data as HostAddModalMessage
                const remote = getRemoteConfigByNameSync(payload.remoteName)
                if (!remote) return
                openModal({
                    remoteName: payload.remoteName,
                    path: payload.path,
                    displayName: payload.displayName ?? payload.path,
                    width: payload.width,
                    height: payload.height,
                    x: payload.x,
                    y: payload.y,
                })
            }
        }
        window.addEventListener('message', handler)
        return () => window.removeEventListener('message', handler)
    }, [openModal])

    return {
        modals,
        openModal,
        closeModal,
        closeAllModals,
    }
}
