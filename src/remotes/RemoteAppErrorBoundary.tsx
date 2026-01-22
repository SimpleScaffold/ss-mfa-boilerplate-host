import { Component, ReactNode } from 'react'
import { RemoteAppConfig } from './config'

interface RemoteAppErrorBoundaryProps {
    config: RemoteAppConfig
    children: ReactNode
    fallback?: (error: Error) => ReactNode
}

interface RemoteAppErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * 리모트 앱 에러 바운더리
 * 
 * 리모트 앱 로딩 또는 실행 중 발생하는 에러를 캐치하여 처리합니다.
 */
export class RemoteAppErrorBoundary extends Component<
    RemoteAppErrorBoundaryProps,
    RemoteAppErrorBoundaryState
> {
    constructor(props: RemoteAppErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
        }
    }

    static getDerivedStateFromError(error: Error): RemoteAppErrorBoundaryState {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(
            `Remote App Error (${this.props.config.id}):`,
            error,
            errorInfo
        )
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error)
            }

            return (
                <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                        {this.props.config.name} 로딩 실패
                    </h3>
                    <p className="text-red-600 text-sm">
                        {this.state.error.message || '알 수 없는 오류가 발생했습니다.'}
                    </p>
                    <button
                        onClick={() =>
                            this.setState({ hasError: false, error: null })
                        }
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        다시 시도
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
