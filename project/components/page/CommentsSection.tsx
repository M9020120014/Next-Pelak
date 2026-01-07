'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from '@/core/components/ui/Pelak'
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from '@/project/config/site'
import { pageDetailTranslator } from '@/project/data/translations/pageDetail'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'

type CommentRecord = {
  id: number
  parentid: number | null
  userid: number
  content: string
  createdat: string
  isapproved?: boolean
  isdeleted?: boolean
  likes_count?: number
  importance?: number
  user_liked?: boolean
  children?: CommentRecord[]
}

interface CommentsSectionProps {
  pageId: number
  userId: number | null
  userName: string | null
  lang: LANGUAGE_TYPE
  iDevice: string
}

export default function CommentsSection({ 
  pageId, 
  userId, 
  userName, 
  lang,
  iDevice 
}: CommentsSectionProps) {
  const t = pageDetailTranslator[lang]
  const router = useRouter()
  const { csrfToken } = useSecurity()
  const { authState } = useAuth(iDevice)
  
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [content, setContent] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortType, setSortType] = useState<'time_desc' | 'time_asc' | 'likes_desc' | 'importance_desc'>('time_desc')
  const [likes, setLikes] = useState<Map<number, { count: number; liked: boolean }>>(new Map())
  const commentFormRef = useRef<HTMLDivElement>(null)

  const isAuthenticated = authState === 'authenticated' && userId !== null

  const normalizedComments = (raw: unknown): CommentRecord[] => {
    let comments: CommentRecord[] = []
    
    // Handle array directly
    if (Array.isArray(raw)) {
      comments = raw as CommentRecord[]
    } 
    // Handle object with comments property
    else if (raw && typeof raw === 'object' && 'comments' in raw) {
      const maybeComments = (raw as { comments?: unknown }).comments
      if (Array.isArray(maybeComments)) {
        comments = maybeComments as CommentRecord[]
      }
    }
    
    // Filter out deleted comments and ensure all required fields exist
    return comments
      .filter((comment): comment is CommentRecord => {
        // Ensure comment is not deleted and has required fields
        return (
          comment !== null &&
          typeof comment === 'object' &&
          !comment.isdeleted &&
          typeof comment.id === 'number' &&
          typeof comment.userid === 'number' &&
          typeof comment.content === 'string'
        )
      })
      .map((comment) => ({
        ...comment,
        // Ensure optional fields have defaults
        isapproved: comment.isapproved ?? true,
        isdeleted: comment.isdeleted ?? false,
        likes_count: comment.likes_count ?? 0,
        importance: comment.importance ?? 0,
        user_liked: comment.user_liked ?? false,
        parentid: comment.parentid ?? null,
      }))
  }

  const commentTree = useMemo(() => {
    const map = new Map<number, CommentRecord>()
    const roots: CommentRecord[] = []

    const validComments = comments.filter((c) => c.isdeleted !== true)

    validComments.forEach((c) => map.set(c.id, { ...c, children: [] }))

    map.forEach((item) => {
      if (item.parentid && map.has(item.parentid)) {
        map.get(item.parentid)!.children!.push(item)
      } else {
        roots.push(item)
      }
    })

    return roots
  }, [comments])

  const refreshComments = useCallback(async (retryCount = 0) => {
    setLoading(true)
    setError(null)
    try {
      const headers: HeadersInit = { accept: 'application/json' }
      const accessToken = getAccessToken()
      if (accessToken && isAuthenticated) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }
      
      const response = await fetch(`/api/comments?pageId=${pageId}&sort=${sortType}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      })
      
      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = t.commentError
        try {
          const errorData = await response.json()
          if (errorData && typeof errorData === 'object') {
            if (errorData.message && typeof errorData.message === 'string') {
              errorMessage = errorData.message
            } else if (errorData.title && typeof errorData.title === 'string') {
              errorMessage = errorData.title
            }
          }
        } catch {
          // If we can't parse error response, use default message
        }

        // Retry logic for temporary errors (5xx and network errors)
        const isTemporaryError = response.status >= 500 || response.status === 0
        if (isTemporaryError && retryCount < 2) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return refreshComments(retryCount + 1)
        }

        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }

      const fetchedComments = normalizedComments(data)
      setComments(fetchedComments)
      
      // Initialize likes map from fetched comments
      const newLikesMap = new Map<number, { count: number; liked: boolean }>()
      const updateLikesRecursive = (comments: CommentRecord[]) => {
        comments.forEach(comment => {
          newLikesMap.set(comment.id, {
            count: comment.likes_count || 0,
            liked: comment.user_liked || false
          })
          if (comment.children) {
            updateLikesRecursive(comment.children)
          }
        })
      }
      updateLikesRecursive(fetchedComments)
      setLikes(newLikesMap)
    } catch (err) {
      console.error('Error fetching comments:', err)
      // Extract error message from error object
      const errorMessage = err instanceof Error ? err.message : t.commentError
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [pageId, sortType, isAuthenticated, t.commentError])

  useEffect(() => {
    refreshComments()
  }, [refreshComments])

  // Scroll to comment form when replying to a comment
  useEffect(() => {
    if (parentId !== null && commentFormRef.current) {
      commentFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
      setTimeout(() => {
        const textarea = commentFormRef.current?.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }, 300)
    }
  }, [parentId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!content.trim()) {
      return
    }
    if (!userId || !isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/${lang}/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        throw new Error('Access token not found')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageId,
          content: content.trim(),
          parentId: parentId || null,
        }),
      })

      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = t.submitError
        try {
          const payload = await response.json()
          if (payload && typeof payload === 'object') {
            if (payload.message && typeof payload.message === 'string') {
              errorMessage = payload.message
            } else if (payload.title && typeof payload.title === 'string') {
              errorMessage = payload.title
            }
          }
        } catch {
          // If we can't parse error response, use default message
        }
        throw new Error(errorMessage)
      }

      setContent('')
      setParentId(null)
      await refreshComments()
    } catch (err) {
      console.error(err)
      setError(t.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLoginClick = () => {
    const currentPath = window.location.pathname
    router.push(`/${lang}/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  const handleLike = async (commentId: number) => {
    if (!isAuthenticated || !userId) {
      const currentPath = window.location.pathname
      router.push(`/${lang}/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    try {
      const accessToken = getAccessToken()
      if (!accessToken) {
        throw new Error('Access token not found')
      }

      const response = await fetch('/api/comments/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ commentId }),
      })

      if (!response.ok) {
        // Try to extract error message from response
        let errorMessage = 'Failed to like comment'
        try {
          const payload = await response.json()
          if (payload && typeof payload === 'object') {
            if (payload.message && typeof payload.message === 'string') {
              errorMessage = payload.message
            } else if (payload.title && typeof payload.title === 'string') {
              errorMessage = payload.title
            }
          }
        } catch {
          // If we can't parse error response, use default message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const { liked, likesCount } = data

      // Update likes map
      setLikes(prev => {
        const newMap = new Map(prev)
        newMap.set(commentId, { count: likesCount, liked })
        return newMap
      })

      // Update comments to reflect new like count
      setComments(prev => {
        const updateCommentLikes = (comments: CommentRecord[]): CommentRecord[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, likes_count: likesCount }
            }
            if (comment.children) {
              return { ...comment, children: updateCommentLikes(comment.children) }
            }
            return comment
          })
        }
        return updateCommentLikes(prev)
      })
    } catch (err) {
      console.error(err)
      setError(t.submitError)
    }
  }

  return (
    <div className="space-y-018-4">
      {/* Sort Dropdown */}
      {!loading && comments.length > 0 && (
        <div className="flex items-center justify-between gap-018-4">
          <label className="text-Text font-title">{t.sortBy}:</label>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as typeof sortType)}
            className="rounded-2 border border-Border bg-White px-012-3 py-008-2 text-Text focus:outline-none focus:border-Primary transition-colors"
            dir={lang === 'fa' ? 'rtl' : 'ltr'}
          >
            <option value="time_desc">{t.sortTimeDesc}</option>
            <option value="time_asc">{t.sortTimeAsc}</option>
            <option value="likes_desc">{t.sortLikesDesc}</option>
            <option value="importance_desc">{t.sortImportanceDesc}</option>
          </select>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-018-4">

      {!loading && commentTree.length > 0 && (
          <div className="space-y-018-4">
            {commentTree.map((comment) => (
              <CommentNode 
                key={comment.id} 
                comment={comment} 
                onReply={setParentId}
                onLike={handleLike}
                likesMap={likes}
                depth={0}
                isAuthenticated={isAuthenticated}
                userId={userId}
                lang={lang}
                t={t}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-032-6">
            <svg className="h-6 w-6 animate-spin text-Mid" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className={`${lang === 'fa' ? 'mr' : 'ml'}-008-2 text-Mid`}>
              {t.loadingComments}
            </span>
          </div>
        )}
        
        {error && (
          <div className="rounded-3 border border-Error/50 bg-ErrorLight/10 p-018-4">
            <div className="flex items-start justify-between gap-012-3">
              <div className="flex-1">
                <p className="text-Error font-title mb-008-2">{t.commentError}</p>
                <p className="text-Mid">{error}</p>
              </div>
              <P.Button
                type="button"
                onClick={() => refreshComments()}
                Theme="secondary"
                Size="sm"
                className="shrink-0"
              >
                <svg className="h-4 w-4 inline-block mr-004-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {lang === 'fa' ? 'تلاش مجدد' : 'Retry'}
              </P.Button>
            </div>
          </div>
        )}

        {!loading && !comments.length && (
          <div className="flex flex-col items-center justify-center py-048-N text-center">
            <P.Icon Icon="categories" Size="xl" className="text-Mid/50 mb-012-3" />
            <p className="text-Mid">{t.noComments}</p>
            <p className="text-Mid mt-004-1">{t.firstComment}</p>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <div ref={commentFormRef} className="bg-White rounded-3 border border-Border shadow-sm overflow-hidden">
        <div className="px-018-4 py-012-3 border-b border-Border bg-linear-to-br from-PrimaryLight/20 to-Primary/10">
          <div className="flex items-center gap-008-2">
            <P.Icon Icon="categories" Size="md" className="text-Primary" />
            <h3 className="font-title text-Text">{t.addComment}</h3>
          </div>
        </div>
        <div className="p-018-4">
          <form onSubmit={handleSubmit} className="space-y-018-4">
            {!isAuthenticated && (
              <div className="rounded-2 border border-Warning/50 bg-WarningLight/10 p-012-3">
                <p className="text-Warning">
                  {t.loginToComment}{' '}
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="text-Primary hover:text-PrimaryDark underline"
                  >
                    {lang === 'fa' ? 'وارد شوید' : 'Login'}
                  </button>
                </p>
              </div>
            )}

            {parentId && (
              <div className="flex items-center justify-between rounded-2 border border-Border bg-Background/50 p-012-3">
                <div className="flex items-center gap-008-2">
                  <svg className="h-4 w-4 text-Primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="text-Mid">
                    {lang === 'fa' ? `در حال پاسخ به دیدگاه #${parentId}` : `Replying to comment #${parentId}`}
                  </span>
                </div>
                <P.Button
                  type="button"
                  onClick={() => setParentId(null)}
                  Theme="secondary"
                  Size="sm"
                >
                  {t.cancelReply}
                </P.Button>
              </div>
            )}

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={isAuthenticated ? t.writeComment : t.loginRequired}
              className="w-full min-h-32 resize-none rounded-2 border border-Border bg-White px-018-4 py-012-3 text-Text focus:outline-none focus:border-Primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              dir={lang === 'fa' ? 'rtl' : 'ltr'}
              disabled={submitting || !isAuthenticated}
            />

            <div className="flex items-center justify-between gap-018-4">
              <P.Button
                type="submit"
                disabled={submitting || !content.trim() || !isAuthenticated}
                Theme="primary"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin inline-block mr-008-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 inline-block mr-008-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {t.submitComment}
                  </>
                )}
              </P.Button>
              
              {userName && (
                <p className="text-Mid hidden sm:block">
                  {lang === 'fa' ? `${userName} عزیز، سپاس از همراهی شما!` : `Thank you, ${userName}!`}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

type CommentNodeProps = {
  comment: CommentRecord
  depth: number
  onReply: (id: number) => void
  onLike: (id: number) => void
  likesMap: Map<number, { count: number; liked: boolean }>
  isAuthenticated: boolean
  userId: number | null
  lang: LANGUAGE_TYPE
  t: typeof pageDetailTranslator[LANGUAGE_TYPE]
}

function CommentNode({ comment, depth, onReply, onLike, likesMap, isAuthenticated, userId, lang, t }: CommentNodeProps) {
  const createdAt = new Date(comment.createdat)
  const formattedDate = createdAt.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const userInitial = `U${comment.userid}`.slice(0, 2)
  const likeInfo = likesMap.get(comment.id) || { count: comment.likes_count || 0, liked: false }

  return (
    <div
      className={`space-y-012-3 ${depth > 0 ? `mr-024-5 border-r-2 border-Border pr-018-4` : ''}`}
    >
      <div className={`bg-White rounded-3 border border-Border shadow-sm transition-all hover:shadow-md p-018-4 ${depth > 0 ? 'bg-Background/30' : ''}`}>
        <div className="flex items-start gap-012-3">
          <div className="h-040-8 w-040-8 shrink-0 rounded-full bg-PrimaryLight/10 flex items-center justify-center text-Primary font-title">
            {userInitial}
          </div>
          
          <div className="flex-1 space-y-008-2 min-w-0">
            <div className="flex items-center justify-between gap-008-2 flex-wrap">
              <div className="flex items-center gap-008-2">
                <span className="inline-flex items-center px-012-3 py-006-1.5 rounded-2 bg-Background text-Mid font-title">
                  {comment.userid}
                </span>
              </div>
              <div className="flex items-center gap-006-1.5 text-Mid">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate}</span>
              </div>
            </div>
            
            <p className="leading-relaxed text-Text whitespace-pre-wrap">
              {comment.content}
            </p>
            
            <div className="flex items-center gap-012-3 flex-wrap">
              <P.Button
                type="button"
                onClick={() => isAuthenticated && onReply(comment.id)}
                disabled={!isAuthenticated}
                Theme="secondary"
                Size="sm"
              >
                <svg className="h-3.5 w-3.5 inline-block mr-004-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                {t.reply}
              </P.Button>

              <P.Button
                type="button"
                onClick={() => isAuthenticated && onLike(comment.id)}
                disabled={!isAuthenticated}
                Theme={likeInfo.liked ? "primary" : "secondary"}
                Size="sm"
              >
                <svg 
                  className={`h-3.5 w-3.5 inline-block mr-004-1 ${likeInfo.liked ? 'fill-current' : ''}`} 
                  fill={likeInfo.liked ? "currentColor" : "none"} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeInfo.liked ? t.unlike : t.like} ({likeInfo.count})
              </P.Button>
            </div>
          </div>
        </div>
      </div>

      {comment.children && comment.children.length > 0 && (
        <div className="mt-008-2 space-y-018-4">
          {comment.children.map((child) => (
            <CommentNode 
              key={child.id} 
              comment={child} 
              depth={depth + 1} 
              onReply={onReply}
              onLike={onLike}
              likesMap={likesMap}
              isAuthenticated={isAuthenticated}
              userId={userId}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

