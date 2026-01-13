'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useState } from 'react'
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from '@/core/config/lang'
import { pageDetailTranslator } from '@/site/translations/pageDetail'

interface CopyLinkButtonProps {
  url: string
  lang: LANGUAGE_TYPE
}

export default function CopyLinkButton({ url, lang }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const t = pageDetailTranslator[lang]

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Silent fail
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? t.linkCopied : t.copyLink}
      className="w-028-6 h-028-6 rounded-2 border border-Border bg-White hover:bg-PrimaryLight/20 hover:border-Primary hover:text-Primary flex items-center justify-center transition-all"
    >
      {copied ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

