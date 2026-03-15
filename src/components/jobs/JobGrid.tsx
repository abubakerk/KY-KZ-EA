'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import JobCard from './JobCard'
import JobDrawer from './JobDrawer'
import type { Job, PaginatedResponse } from '@/types'
import { Loader2 } from 'lucide-react'

export default function JobGrid() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const fetchJobs = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams()
    const q = searchParams.get('q') || ''
    const country = searchParams.get('country') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''
    if (q) params.set('query', q)
    if (country) params.set('country', country)
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    params.set('page', String(p))

    try {
      const res = await fetch(`/api/jobs?${params}`)
      const data: PaginatedResponse<Job> = await res.json()
      setJobs(data.data || [])
      setTotalPages(data.totalPages || 1)
      setCount(data.count || 0)
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [searchParams])

  useEffect(() => { setPage(1); fetchJobs(1) }, [searchParams])

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          {loading ? 'Loading...' : `${count.toLocaleString()} job${count !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-emerald-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg font-medium mb-2">No jobs found</p>
          <p className="text-sm">Try different keywords or clear your filters</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onJobClick={setSelectedJob}
                onSaveToggle={(id, saved) => setJobs(prev => prev.map(j => j.id === id ? { ...j, is_saved: saved } : j))}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button onClick={() => { setPage(p => p - 1); fetchJobs(page - 1) }} disabled={page === 1}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
              <span className="flex items-center px-4 text-sm text-stone-500">Page {page} of {totalPages}</span>
              <button onClick={() => { setPage(p => p + 1); fetchJobs(page + 1) }} disabled={page === totalPages}
                className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </>
      )}

      <JobDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  )
}
