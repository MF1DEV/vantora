'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
}

export function LazyImage({ src, alt, className = '', width, height, priority = false }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse" />
      )}
      
      {/* Image */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
        />
      )}
    </div>
  )
}

interface PrefetchLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function PrefetchLink({ href, children, className = '' }: PrefetchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [isPrefetched, setIsPrefetched] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isPrefetched) {
            // Prefetch the link
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = href
            document.head.appendChild(link)
            setIsPrefetched(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px' }
    )

    if (linkRef.current) {
      observer.observe(linkRef.current)
    }

    return () => observer.disconnect()
  }, [href, isPrefetched])

  return (
    <a ref={linkRef} href={href} className={className}>
      {children}
    </a>
  )
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, interval - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, interval])

  return throttledValue
}

interface CachedDataOptions<T> {
  key: string
  fetcher: () => Promise<T>
  ttl?: number // Time to live in milliseconds
}

export function useCachedData<T>({ key, fetcher, ttl = 5 * 60 * 1000 }: CachedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(key)
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < ttl) {
            setData(cachedData)
            setIsLoading(false)
            return
          }
        }

        // Fetch fresh data
        setIsLoading(true)
        const freshData = await fetcher()
        
        // Cache the data
        localStorage.setItem(key, JSON.stringify({
          data: freshData,
          timestamp: Date.now()
        }))

        setData(freshData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [key, ttl])

  const invalidateCache = () => {
    localStorage.removeItem(key)
  }

  return { data, isLoading, error, invalidateCache }
}

export class QueryCache {
  private cache: Map<string, { data: any; timestamp: number }>
  private ttl: number

  constructor(ttl: number = 5 * 60 * 1000) {
    this.cache = new Map()
    this.ttl = ttl
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const globalQueryCache = new QueryCache()

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
}) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + 2
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function optimizeImage(url: string, width: number, quality: number = 75): string {
  // For Supabase Storage or Cloudinary, you can add transformation params
  // Example for Cloudinary: return `${url}?w=${width}&q=${quality}&f=auto`
  
  // For Next.js Image Optimization
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = document.createElement('img')
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
        img.src = url
      })
    })
  )
}

export function getBatchedData<T>(
  ids: string[],
  fetcher: (id: string) => Promise<T>,
  batchSize: number = 10
): Promise<T[]> {
  const batches: string[][] = []
  for (let i = 0; i < ids.length; i += batchSize) {
    batches.push(ids.slice(i, i + batchSize))
  }

  return Promise.all(
    batches.map(batch =>
      Promise.all(batch.map(id => fetcher(id)))
    )
  ).then(results => results.flat())
}

export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
