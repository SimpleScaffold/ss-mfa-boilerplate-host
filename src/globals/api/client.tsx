import axios from 'axios'

const getApiBaseUrl = (): string => String(import.meta.env?.VITE_API_HOST ?? '')

export const client = axios.create({
    baseURL: getApiBaseUrl(),

    // import.meta.env.VITE_API_HOST,
    // xsrfCookieName: 'csrftoken',
    // xsrfHeaderName: 'X-CSRFToken',
})

export const remoteClient = axios.create({
    baseURL: getApiBaseUrl() + '/api/remote' || '',
    // import.meta.env.VITE_API_HOST,
    // xsrfCookieName: 'csrftoken',
    // xsrfHeaderName: 'X-CSRFToken',
})

export const stream = axios.create({
    baseURL: getApiBaseUrl(),
    responseType: 'stream',
})
