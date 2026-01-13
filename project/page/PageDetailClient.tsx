'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import Link from 'next/link'
import Image from 'next/image'
/* --- Components ------------------------------------------------------------------------------- */
import { AspectRatio } from '@/core/components/ui/AspectRatio'
import CopyLinkButton from '@/project/components/page/CopyLinkButton'
import CommentsSectionWrapper from '@/project/components/page/CommentsSectionWrapper'
import { UI as P } from '@/core/components/ui/Pelak'
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE, SITE } from '@/project/config/site'
import { pageDetailTranslator } from '@/project/data/translations/pageDetail'

/* --- Page Type Interface ---------- */
interface PageType {
  id: number
  title: string | null
  description: string | null
  keywords: string | null
  content: string | null
  media: string | null
  url: string
  publishedtime: string | null
  modifiedtime: string | null
  authors: number | null
  sectionid: number | null
  typeid: number | null
  tags: string | null
  status: number | null
  lang: number | null
  created_at: string | null
  updated_at: string | null
}

interface PageDetailClientProps {
  page: PageType
  lang: LANGUAGE_TYPE
  iDevice: string
  imageUrl: string | null
}

/* --- Calculate Reading Time ------- */
const calculateReadingTime = (content: string | null | undefined): number => {
  if (!content) return 0
  // Remove HTML tags and count words
  const text = content.replace(/<[^>]*>/g, '').trim()
  const words = text.split(/\s+/).filter(word => word.length > 0).length
  const readingTime = Math.ceil(words / 200) // 200 words per minute
  return readingTime || 1 // Minimum 1 minute
}

/* --- Get First Words -------------- */
const getFirstWords = (text: string | null | undefined, charLimit: number = 40): string => {
  if (!text) return ''
  if (text.length <= charLimit) return text

  // Find the last complete word within the limit
  const limitedText = text.slice(0, charLimit)
  const lastSpaceIndex = limitedText.lastIndexOf(' ')

  let result: string
  if (lastSpaceIndex > 0) {
    // Complete the last word
    result = text.slice(0, text.indexOf(' ', lastSpaceIndex))
  } else {
    // No spaces found, use the limited text
    result = limitedText
  }

  // Only add "..." if there's more content after
  return result.length < text.length ? result + '...' : result
}

/* --- Page Detail Client Component - */
export default function PageDetailClient({ page, lang, iDevice, imageUrl }: PageDetailClientProps) {
  const t = pageDetailTranslator[lang]
  const readingTime = calculateReadingTime(page.content)
  const formattedDate = page.publishedtime
    ? new Date(page.publishedtime).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')
    : ''
  const shareUrl = `${SITE.Data.url}/p/${page.id}`
  const shareText = page.title || ''
  const tags = page.tags
    ? page.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
    : null
  const shortDescription = getFirstWords(page.description, 40)

  return (
    <>
      <main className=" bg-Background lg:pt-034-7">
        <P.Container className='space-y-018-4'>
          {/* --- Main Image --------- */}
          <div className="bg-White rounded-lg border border-Border shadow-sm overflow-hidden">
            <AspectRatio ratio={16 / 9} className="bg-Background relative">
              {imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={imageUrl}
                    alt={page.title || ''}
                    fill
                    className="object-cover"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 w-full h-full bg-linear-to-br from-PrimaryLight/10 to-Primary/5">
                  <div className="w-16 h-16 text-Mid/50">
                    <P.Icon Icon="category" Size="xl" />
                  </div>
                  <p className="text-G text-Mid">{t.noImage}</p>
                </div>
              )}
              {/* {formattedDate && (
                <div className="absolute top-018-4 left-0 px-018-4 py-012-3 flex items-center gap-008-2 text-Background bg-Shadow/72 rounded-s-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formattedDate}</span>
                </div>
              )} */}
              {shortDescription && (
                <p className="absolute bottom-0 right-0 left-0 bg-Background/72 px-018-4 py-012-3">
                  {shortDescription}
                </p>
              )}
            </AspectRatio>
            <div className="px-018-4 py-012-3 border-t border-Border flex flex-row items-start sm:items-center justify-between gap-018-4">
              {/* Share Buttons */}
              <div className="flex items-center gap-012-3">
                <span className="text-G text-Mid hidden sm:inline">{t.share}:</span>
                <div className="flex items-center gap-008-2">
                  {/* WhatsApp */}
                  <a
                    href={`whatsapp://send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.shareOnWhatsApp}
                    className="w-028-6 h-028-6 rounded-2 border border-Border bg-White hover:bg-green-50 hover:border-green-500 hover:text-green-600 flex items-center justify-center transition-all"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.shareOnTelegram}
                    className="w-028-6 h-028-6 rounded-2 border border-Border bg-White hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                    aria-label={t.shareViaEmail}
                    className="w-028-6 h-028-6 rounded-2 border border-Border bg-White hover:bg-PrimaryLight/20 hover:border-Primary hover:text-Primary flex items-center justify-center transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>

                  {/* Copy Link */}
                  <CopyLinkButton url={shareUrl} lang={lang} />
                </div>
              </div>

              {/* Reading Time */}
              <div className="flex items-center gap-018-4">
                <div className="flex items-center gap-008-2 text-F text-Mid bg-PrimaryLight/5 border border-PrimaryLight/20 rounded-2 px-012-3 py-008-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readingTime} {t.readingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Content Card --------- */}
          {page.content && (
            <div className="bg-White rounded-lg border border-Border shadow-sm overflow-hidden">
              <div className="p-024-5 lg:p-028-6">
                <article
                  className="prose prose-invert max-w-none text-Text leading-relaxed text-justify prose-headings:font-bold prose-p:mb-4 prose-a:text-Primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:h-auto page-content-article HTML"
                  dir={lang === 'fa' ? 'rtl' : 'ltr'}
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            </div>
          )}

          {/* --- Meta Info Card --------- */}
          <div className="bg-White rounded-lg border border-Border shadow-sm overflow-hidden">
            <div className="px-018-4 py-012-3 border-b border-Border bg-linear-to-br from-PrimaryLight/20 to-Primary/10">
              <div className="flex items-center gap-008-2">
                <P.Icon Icon="dashboard" Size="md" className="text-Primary" />
                <h2 className="text-E font-title text-Text">{t.pageInfo}</h2>
              </div>
            </div>
            <div className="p-018-4">
              <div className="flex flex-wrap items-center gap-018-4 text-F text-Mid">
                {page.authors && (
                  <div className="flex items-center gap-008-2">
                    <svg className="h-4 w-4 text-Primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t.author}: <span className="text-Text font-title">{page.authors}</span></span>
                  </div>
                )}
                {page.publishedtime && (
                  <>
                    {page.authors && <div className="w-px h-4 bg-Border" />}
                    <div className="flex items-center gap-008-2">
                      <svg className="h-4 w-4 text-Primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{t.published}: <span className="text-Text font-title">{new Date(page.publishedtime).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span></span>
                    </div>
                  </>
                )}
                {page.modifiedtime && page.modifiedtime !== page.publishedtime && (
                  <>
                    {(page.authors || page.publishedtime) && <div className="w-px h-4 bg-Border" />}
                    <div className="flex items-center gap-008-2">
                      <svg className="h-4 w-4 text-Primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>{t.modified}: <span className="text-Text font-title">{new Date(page.modifiedtime).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span></span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- Related Categories Card --------- */}
          {tags && tags.length > 0 && (
            <div className="bg-White rounded-lg border border-Border shadow-sm overflow-hidden">
              <div className="px-018-4 py-012-3 border-b border-Border bg-linear-to-br from-PrimaryLight/20 to-Primary/10">
                <div className="flex items-center gap-008-2">
                  <P.Icon Icon="category" Size="md" className="text-Primary" />
                  <h2 className="text-E font-title text-Text">{t.relatedCategories}</h2>
                </div>
              </div>
              <div className="p-018-4">
                <div className="flex items-start justify-start flex-wrap gap-012-3">
                  {tags.map((tagItem, index) => (
                    <Link
                      key={index}
                      href={`/${lang}/page?tag=${encodeURIComponent(tagItem.trim())}`}
                      className="inline-flex items-center gap-004-1 bg-PrimaryLight/10 text-Primary border border-PrimaryLight/20 px-012-3 py-008-2 rounded-2 text-F font-title hover:bg-Primary hover:text-White hover:border-Primary transition-all"
                    >
                      {tagItem.trim()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- No Content Message ---- */}
          {!page.content && (
            <div className="bg-White rounded-lg border border-Border shadow-sm p-028-6">
              <div className="flex flex-col items-center gap-012-3 text-center">
                <div className="w-048-N h-048-N rounded-3 bg-Background flex items-center justify-center">
                  <P.Icon Icon="category" Size="xl" className="text-Mid/60" />
                </div>
                <p className="text-F font-title text-Text">{t.noContent}</p>
              </div>
            </div>
          )}

          {/* --- Comments Card --------- */}
          {page.id && (
            <div className="bg-White rounded-lg border border-Border shadow-sm overflow-hidden">
              <div className="px-018-4 py-012-3 border-b border-Border bg-linear-to-br from-PrimaryLight/20 to-Primary/10">
                <div className="flex items-center gap-008-2">
                  <P.Icon Icon="category" Size="md" className="text-Primary" />
                  <h2 className="text-E font-title text-Text">{t.comments}</h2>
                </div>
              </div>
              <div className="p-018-4">
                <CommentsSectionWrapper pageId={page.id} lang={lang} iDevice={iDevice} />
              </div>
            </div>
          )}

        </P.Container>
      </main>
    </>
  )
}