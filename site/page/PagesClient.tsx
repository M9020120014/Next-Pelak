'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from '@/core/components/ui/Pelak'
import { Skeleton } from '@/core/components/ui/Skeleton'
import { AspectRatio } from '@/core/components/ui/AspectRatio'
import { Icon } from '@/core/components/ui/Icon'
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from '@/core/config/lang'
import { LANGUAGE_DATA } from "@/core/config/lang";
import { pageTranslator } from '@/site/translations/page'
import { ENV } from '@/core/config/env'
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Get Image URL ---------------- */
const getImageUrl = (media: string | null | undefined): string | null => {
  if (!media) return null
  
  // If media is already a full URL, return it as is
  if (media.startsWith('http://') || media.startsWith('https://')) {
    return media
  }
  
  // If SSS_OBJECT is configured, prepend it to the media path
  if (ENV.SSS_OBJECT) {
    const baseUrl = ENV.SSS_OBJECT.endsWith('/') ? ENV.SSS_OBJECT : `${ENV.SSS_OBJECT}/`
    return `${baseUrl}${media}`
  }
  
  // Fallback: return media as is (might be a relative path)
  return media
}

interface PageType {
  id: number
  title: string | null
  description: string | null
  url: string
  modifiedtime: string | null
  publishedtime: string | null
  media: string | null
}

interface PagesResponse {
  success: boolean
  title?: string
  message?: string
  page?: PageType[]
}

/* --- Pages Client Component ----------------------------------------- */
interface PagesClientProps {
  lang: LANGUAGE_TYPE
}

export default function PagesClient({ lang }: PagesClientProps) {
  const [page, setPages] = useState<PageType[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const t = pageTranslator[lang]
  const langId = LANGUAGE_DATA.langId[lang]

  /* --- Fetch Pages ---------------- */
  const fetchPages = useCallback(async (currentOffset: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '12',
        offset: currentOffset.toString(),
        lang: langId,
      })

      const response = await fetch(`/api/page?${params.toString()}`)
      const data: PagesResponse = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'خطا در دریافت صفحات')
        return
      }

      if (!data.page || data.page.length === 0) {
        setHasMore(false)
      } else {
        setPages(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const nextItems = data.page!.filter(item => !existingIds.has(item.id))
          return [...prev, ...nextItems]
        })
        setOffset(currentOffset + 12)
        if (data.page.length < 12) {
          setHasMore(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }, [langId])

  /* --- Load More ------------------ */
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPages(offset)
    }
  }

  /* --- Initial Load --------------- */
  useEffect(() => {
    fetchPages(0)
  }, [fetchPages])

  /* --- Get First Words ------------- */
  const getFirstWords = (text: string | null | undefined, charLimit: number = 45): string => {
    if (!text) return ''
    if (text.length <= charLimit) return text

    const limitedText = text.slice(0, charLimit)
    const lastSpaceIndex = limitedText.lastIndexOf(' ')

    let result: string
    if (lastSpaceIndex > 0) {
      result = text.slice(0, text.indexOf(' ', lastSpaceIndex))
    } else {
      result = limitedText
    }

    return result.length < text.length ? result + '...' : result
  }

  return (
    <>
      {/* --- Main Content --------- */}
      <main className=" bg-Background lg:pt-040-8">
        <P.Container className='space-y-008-2'>
        {/* Header */}
        <div className="bg-linear-to-br from-PrimaryLight/20 via-Primary/10 to-SecondaryLight/20 rounded-lg p-012-3 border border-PrimaryLight/30">
          <div className="flex items-center gap-012-3">
            <div className="w-040-8 h-040-8 rounded-sm bg-Primary/20 flex items-center justify-center text-Primary">
              <Icon Icon="category" Size="lg" />
            </div>
            <div>
              <p className="text-Mid text-C">{t.description}</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-ErrorLight/10 border border-ErrorLight/30 rounded-lg p-028-6">
              <p className="text-Error">{error}</p>
          </div>
        )}

        {/* --- Pages List ------- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-018-4">
          {/* Loading skeletons on first load */}
          {loading && page.length === 0 &&
            Array.from({ length: 12 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-full bg-White rounded-md border border-Border shadow-sm overflow-hidden"
              >
                <AspectRatio ratio={16 / 9} className="bg-Background w-full h-full">
                  <Skeleton className="w-full h-full" />
                  {/* Overlay footer matching real card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-Background/80 px-012-3 py-018-4 border-t border-Border">
                    <Skeleton className="h-6 w-3/4 mb-008-2 bg-Text/20 rounded" />
                    <Skeleton className="h-4 w-full bg-Text/20 rounded" />
                  </div>
                </AspectRatio>
              </div>
            ))}

          {/* Real items */}
          {page.map((page) => (
            <Link href={`/${lang}/page/${page.url}`} key={page.id} className="group">
              <div className="h-full bg-White rounded-md border border-Border shadow-sm hover:border-Primary hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Image with 16/9 aspect ratio */}
                <AspectRatio ratio={16 / 9} className="bg-Background w-full h-full relative">
                  {getImageUrl(page.media) ? (
                    <Image
                      src={getImageUrl(page.media)!}
                      alt={page.title || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-linear-to-br from-PrimaryLight/10 to-Primary/5">
                      <Icon Icon="category" Size="xl" className="text-Mid/40" />
                      <p className="text-G text-Background">{t.noImage}</p>
                    </div>
                  )}
                  {/* Overlay footer */}
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-linear-to-t from-Background/80 via-Background/40 to-Primary/5"></div>
                  {/* Overlay footer */}
                  <div className="absolute bottom-0 left-0 right-0 bg-Background/40 group-hover:bg-Background/72 to-transparent px-012-3 py-012-3 border-t border-Border/50 group-hover:border-Primary">
                    <h3 className="text-E font-title text-Text group-hover:text-PrimaryDark line-clamp-2 transition-colors">
                      {getFirstWords(page.title)}
                    </h3>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          ))}
        </div>

        {/* --- Load More / States -------- */}
        {hasMore && (
          <div className="w-full flex justify-center items-center pt-028-6">
            <P.Button
              type="button"
              onClick={handleLoadMore}
              disabled={loading || !hasMore}
              ThemeProps="default"
              Theme="primary"
              Rounded="md"
              Size="md"
              className="gap-008-2"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  {t.loading}
                </>
              ) : (
                t.loadMore
              )}
            </P.Button>
          </div>
        )}

        {/* --- No More Items ---- */}
        {!hasMore && page.length > 0 && (
          <div className="w-full flex justify-center items-center pt-028-6">
            <div className="bg-PrimaryLight/5 border border-PrimaryLight/20 rounded-md px-018-4 py-012-3">
              <p className="text-Mid text-F">{t.noMoreItems}</p>
            </div>
          </div>
        )}

        {/* --- Empty State ------ */}
        {!loading && page.length === 0 && !error && (
          <div className="w-full flex justify-center items-center py-028-6">
            <div className="bg-White rounded-lg border border-Border shadow-sm p-028-6 rounded-lg">
              <div className="flex flex-col items-center gap-012-3 text-center">
                <div className="w-048-N h-048-N rounded-md bg-Background flex items-center justify-center">
                  <Icon Icon="category" Size="xl" className="text-Mid/60" />
                </div>
                <p className="font-title text-Text">{t.emptyTitle}</p>
                <p className="text-Mid max-w-md">{t.emptyDescription}</p>
              </div>
            </div>
          </div>
        )}
        </P.Container>
      </main>
    </>
  )
}

