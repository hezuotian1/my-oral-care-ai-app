import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api',
  // 图像分析需要调用视觉大模型，耗时较长，超时放宽
  timeout: 90000,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  (err) => {
    const status = err.response?.status
    if (status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
    const message: string =
      err.response?.data?.message || (err.code === 'ECONNABORTED' ? '请求超时，请重试' : '网络异常，请稍后重试')
    return Promise.reject(new Error(message))
  },
)

interface Request {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export default instance as unknown as Request
