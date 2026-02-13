'use client'

import {
    createContext,
    useCallback,
    useState,
    use,
    type ReactNode,
    type RefObject,
} from 'react'

export interface ModalConstraintContextValue {
    constraintRef: RefObject<HTMLElement | null> | null
    setConstraintRef: (ref: RefObject<HTMLElement | null> | null) => void
}

const ModalConstraintContext =
    createContext<ModalConstraintContextValue | null>(null)

export function useModalConstraint() {
    const ctx = use(ModalConstraintContext)
    return ctx
}

export function ModalConstraintProvider({ children }: { children: ReactNode }) {
    const [constraintRef, setConstraintRefState] =
        useState<RefObject<HTMLElement | null> | null>(null)

    const setConstraintRef = useCallback(
        (ref: RefObject<HTMLElement | null> | null) => {
            setConstraintRefState(ref)
        },
        [],
    )

    return (
        <ModalConstraintContext.Provider
            value={{ constraintRef, setConstraintRef }}
        >
            {children}
        </ModalConstraintContext.Provider>
    )
}
