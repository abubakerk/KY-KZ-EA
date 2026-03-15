'use client'
import { useState } from 'react'
import { MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import type { Job } from '@/types'
import { cn, timeAgo, formatSalary, CATEGORY_COLORS } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Props {
  job: Job
  isSaved?: boolean
  onSaveToggle?: (jobId: string, saved: boolean) => void
  onJobClick?: (job: Job) => void
}

export default function JobCard({ job, isSaved = false, onSaveToggle, onJobClick }: Props) {
  const [saved, setSaved] = useState(isSaved || job.is_saved || false)
  const [loading, setLoading] = useState(false)

  const companyName = job.employer?.company_name || 'Company'
  const isNew = new Date(job.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in to save jobs'); setLoading(false); return }
    if (saved) {
      await supabase.from('saved_jobs').delete().match({ user_id: user.id, job_id: job.id })
      setSaved(false); toast.success('Removed from saved')
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: job.id })
      setSaved(true); toast.success('Job saved!')
    }
    onSaveToggle?.(job.id, !saved)
    setLoading(false)
  }

  return (
    <div
      className="card group cursor-pointer"
      onClick={() => onJobClick?.(job)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-sm flex-shrink-0">
            {companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-stone-900 group-hover:text-emerald-600 transition-colors leading-tight">
              {job.title}
            </h3>
            <p className="text-sm text-stone-500 mt-0.5">
              {companyName}
              {job.employer?.verified && <span className="text-emerald-500 ml-1 text-xs">✓</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {job.is_featured && <span className="badge bg-amber-50 text-amber-700">Featured</span>}
          {isNew && <span className="badge bg-emerald-50 text-emerald-700">New</span>}
          <button
            onClick={toggleSave}
            disabled={loading}
            className={cn('p-1.5 rounded-lg transition-colors',
              saved ? 'text-emerald-600 bg-emerald-50' : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
            )}
          >
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

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <span className="text-xs text-stone-400">{timeAgo(job.created_at)}</span>
        <span className="text-xs text-emerald-600 font-medium group-hover:underline">View & apply →</span>
      </div>
    </div>
  )
}
