import axios from 'axios'
import { getConfig } from '../config'

export const http = axios.create({
  baseURL: getConfig().apiUrl || '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setBaseUrl = (url: string) => {
  http.defaults.baseURL = url
}

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data
    const message =
      responseData?.message ||
      responseData?.error ||
      (typeof responseData === 'string' ? responseData : null) ||
      error.message ||
      'Ошибка сервера'

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: message,
        })
      )
    }

    return Promise.reject(error)
  }
)
