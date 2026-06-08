import axios, { type AxiosError } from 'axios'

const getApiBaseUrl = (): string => String(import.meta.env?.VITE_API_HOST ?? '')

function applyInterceptors(instance: ReturnType<typeof axios.create>) {
    instance.interceptors.response.use(
        (res) => res,
        (error: AxiosError) => {
            const status = error.response?.status
            if (status === 401) {
                console.error('[API] 인증 오류 - 로그인이 필요합니다.')
            } else if (status === 403) {
                console.error('[API] 권한 오류 - 접근이 거부되었습니다.')
            } else if (status && status >= 500) {
                console.error('[API] 서버 오류:', error.message)
            }
            return Promise.reject(error)
        },
    )
    return instance
}

export const client = applyInterceptors(
    axios.create({ baseURL: getApiBaseUrl() }),
)

export const remoteClient = applyInterceptors(
    axios.create({ baseURL: getApiBaseUrl() + '/api/remote' }),
)

export const stream = applyInterceptors(
    axios.create({ baseURL: getApiBaseUrl(), responseType: 'stream' }),
)
