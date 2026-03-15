'use client'
import { useState } from 'react'
import { MapPin, Clock, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react'
import type { Job } from '@/types'
import { cn, timeAgo, formatSalary, CATEGORY_COLORS } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import ApplyModal from './ApplyModal'
import CoverLetterModal from './CoverLetterModal'

interface Props {
  job: Job
  isSaved?: boolean
  onSaveToggle?: (jobId: string, saved: boolean) => void
}

export default function JobCard({ job, isSaved = false, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(isSaved || job.is_saved || false)
  const [loading, setLoading] = useState(false)
  const [showApply, setShowApply] = useState(false)
  const [showCover, setShowCover] = useState(false)

  const companyName = job.employer?.company_name || 'Company'
  const logoInitials = companyName.slice(0, 2).toUpperCase()
  const isNew = new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id }),
      })
      if (res.status === 401) { toast.error('Please sign in to save jobs'); return }
      const data = await res.json()
      setSaved(data.saved)
      onSaveToggle?.(job.id, data.saved)
      toast.success(data.saved ? 'Job saved!' : 'Removed from saved')
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <>
      <div className="card group cursor-pointer" onClick={() => setShowApply(true)}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {job.employer?.company_logo_url ? (
              <img src={job.employer.company_logo_url} alt={companyName}
                className="w-10 h-10 rounded-lg object-cover border border-stone-100" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-sm">
                {logoInitials}
              </div>
            )}
            <div>
              <h3 className="font-medium text-stone-900 group-hover:text-emerald-600 transition-colors leading-tight">
                {job.title}
              </h3>
              <p className="text-sm text-stone-500 mt-0.5">
                {companyName}
                {job.employer?.verified && <span className="ml-1 text-emerald-500">✓</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {job.is_featured && <span className="badge bg-amber-50 text-amber-700">Featured</span>}
            {isNew && <span className="badge bg-emerald-50 text-emerald-700">New</span>}
            <button onClick={toggleSave} disabled={loading}
              className={cn('p-1.5 rounded-lg transition-colors',
                saved ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50')}>
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>

        <p className="text-sm text-stone-600 line-clamp-2 mb-3">
          {(job.description || '').substring(0, 150)}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('badge', CATEGORY_COLORS[job.category] || 'bg-stone-100 text-stone-600')}>
            {job.category.charAt(0).toUpperCase() + job.category.slice(1)}
          </span>
          <span className="badge bg-emerald-50 text-emerald-700 flex items-center gap-1">
            <MapPin size={11} /> {job.city ? `${job.city}, ` : ''}{job.country}
          </span>
          <span className="badge bg-stone-100 text-stone-600 flex items-center gap-1">
            <Clock size={11} /> {job.type}
          </span>
          {(job.salary_min || job.salary_max) && (
            <span className="text-sm font-medium text-emerald-600 ml-auto">
              {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100"
          onClick={e => e.stopPropagation()}>
          <span className="text-xs text-stone-400">{timeAgo(job.created_at)}</span>
          <div className="flex gap-2">
            <button onClick={() => setShowCover(true)}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-orange-600 px-2 py-1 rounded hover:bg-orange-50 transition-colors">
              <Sparkles size={11} /> Cover letter
            </button>
            <button onClick={() => setShowApply(true)}
              className="btn-primary !py-1 !px-3 text-xs">
              Apply
            </button>
          </div>
        </div>
      </div>

      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}
      {showCover && <CoverLetterModal job={job} profile={null} onClose={() => setShowCover(false)} />}
    </>
  )
}
