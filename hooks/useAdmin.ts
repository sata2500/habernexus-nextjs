'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * useDebounce - Değer değişikliklerini geciktirir
 * 
 * Arama inputları gibi sık değişen değerler için kullanışlıdır.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearch = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   // API çağrısı sadece kullanıcı yazmayı bıraktıktan 300ms sonra yapılır
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * useLocalStorage - localStorage ile senkronize state
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State'i başlat
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // localStorage'a yaz
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * useFetch - Veri çekme hook'u
 * 
 * Otomatik loading, error handling ve caching sağlar.
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch<Article[]>('/api/admin/articles')
 */
interface UseFetchOptions {
  /** Otomatik fetch yapılsın mı */
  immediate?: boolean
  /** Cache süresi (ms) */
  cacheTime?: number
  /** Bağımlılıklar değiştiğinde yeniden fetch */
  deps?: unknown[]
}

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Basit in-memory cache
const fetchCache = new Map<string, { data: unknown; timestamp: number }>()

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { immediate = true, cacheTime = 0, deps = [] } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    // Cache kontrolü
    if (cacheTime > 0) {
      const cached = fetchCache.get(url)
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data as T)
        setLoading(false)
        return
      }
    }

    // Önceki isteği iptal et
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      setData(result)

      // Cache'e kaydet
      if (cacheTime > 0) {
        fetchCache.set(url, { data: result, timestamp: Date.now() })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // İptal edilen istekleri yoksay
      }
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [url, cacheTime])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps])

  return { data, loading, error, refetch: fetchData }
}

/**
 * useAsync - Async fonksiyon çalıştırma hook'u
 * 
 * @example
 * const { execute, loading, error } = useAsync(async (id) => {
 *   await deleteArticle(id)
 * })
 */
interface UseAsyncResult<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | undefined>
  loading: boolean
  error: string | null
  reset: () => void
}

export function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncResult<T, Args> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await asyncFunction(...args)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bir hata oluştu'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return { execute, loading, error, reset }
}

/**
 * usePrevious - Önceki değeri saklar
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

/**
 * useOnClickOutside - Element dışına tıklama algılama
 */
export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * useKeyPress - Klavye tuşu algılama
 */
export function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler()
      }
    }

    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
  }, [targetKey, handler])
}

/**
 * useMediaQuery - CSS media query hook'u
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * useIsMobile - Mobil cihaz kontrolü
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * useIsTablet - Tablet cihaz kontrolü
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

/**
 * useIsDesktop - Masaüstü cihaz kontrolü
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}
