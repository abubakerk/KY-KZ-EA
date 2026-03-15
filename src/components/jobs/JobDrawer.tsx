'use client'
import { useState, useEffect } from 'react'
import { X, MapPin, Clock, Briefcase, DollarSign, Calendar, Building2, Sparkles, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn, formatSalary, timeAgo, CATEGORY_COLORS } from '@/lib/utils'
import type { Job } from '@/types'
import ApplicationForm from './ApplicationForm'

interface Props {
  job: Job | null
  onClose: () => void
}

export default function JobDrawer({ job, onClose }: Props) {
  const [saved, setSaved] = useState(job?.is_saved || false)
  const [showApply, setShowApply] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    setSaved(job?.is_saved || false)
    setShowApply(false)
    setApplied(false)
  }, [job])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const toggleSave = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Sign in to save jobs'); return }
    if (saved) {
      await supabase.from('saved_jobs').delete().match({ user_id: user.id, job_id: job!.id })
      setSaved(false); toast.success('Removed from saved')
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: job!.id })
      setSaved(true); toast.success('Job saved!')
    }
  }

  if (!job) return null

  const companyName = job.employer?.company_name || 'Company'

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900 leading-tight">{job.title}</h2>
              <p className="text-stone-500 mt-0.5 flex items-center gap-1.5">
                <Building2 size={13} />
                {companyName}
                {job.employer?.verified && <span className="text-emerald-500 text-xs">✓ Verified</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400 flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {showApply ? (
            <ApplicationForm
              job={job}
              onClose={() => setShowApply(false)}
              onSuccess={() => { setApplied(true); setShowApply(false) }}
            />
          ) : (
            <div className="p-6 space-y-6">

              {/* Key details */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: MapPin, label: 'Location', value: `${job.city ? job.city + ', ' : ''}${job.country}` },
                  { icon: Clock, label: 'Type', value: job.type.charAt(0).toUpperCase() + job.type.slice(1) },
                  { icon: Briefcase, label: 'Category', value: job.category.charAt(0).toUpperCase() + job.category.slice(1) },
                  { icon: DollarSign, label: 'Salary', value: formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency) },
                  ...(job.experience_years_min ? [{ icon: Briefcase, label: 'Experience', value: `${job.experience_years_min}+ years` }] : []),
                  ...(job.application_deadline ? [{ icon: Calendar, label: 'Deadline', value: new Date(job.application_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }] : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-stone-50 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={13} className="text-stone-400" />
                      <span className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-sm font-medium text-stone-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">About the role</h3>
                <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">{job.description}</p>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">Requirements</h3>
                  <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">{job.requirements}</p>
                </div>
              )}

              {/* Posted */}
              <p className="text-xs text-stone-400">Posted {timeAgo(job.created_at)}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!showApply && (
          <div className="p-5 border-t border-stone-100 bg-white flex gap-3">
            {applied ? (
              <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-medium">✓ Application submitted!</p>
                <p className="text-emerald-600 text-sm mt-0.5">We'll notify you when the employer responds</p>
              </div>
            ) : (
              <button
                onClick={() => setShowApply(true)}
                className="flex-1 btn-primary !py-3 !text-base flex items-center justify-center gap-2"
              >
                Apply for this job
              </button>
            )}
            <button
              onClick={toggleSave}
              className={cn('p-3 rounded-xl border transition-colors', saved ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-stone-200 text-stone-400 hover:border-emerald-300')}
            >
              {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
