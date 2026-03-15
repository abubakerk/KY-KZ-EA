'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Users, Briefcase, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-stone-100 text-stone-600',
  reviewing:   'bg-amber-100 text-amber-700',
  shortlisted: 'bg-blue-100 text-blue-700',
  rejected:    'bg-red-100 text-red-600',
  hired:       'bg-emerald-100 text-emerald-700',
}

export default function EmployerDashboard({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: employer } = await supabase
        .from('employer_profiles').select('id').eq('user_id', userId).single()

      if (!employer) { setLoading(false); return }

      const { data: jobsData } = await supabase
        .from('jobs').select('id, title, country, type, created_at, status')
        .eq('employer_id', employer.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5)

      const jobIds = (jobsData || []).map((j: any) => j.id)
      let appsData: any[] = []

      if (jobIds.length > 0) {
        const { data } = await supabase
          .from('applications')
          .select(`*, job:jobs(title), seeker:seeker_profiles(profile:profiles(full_name, email))`)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(6)
        appsData = data || []
      }

      setJobs(jobsData || [])
      setApplications(appsData)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-500" size={24} /></div>

  const hired = applications.filter(a => a.status === 'hired').length
  const pending = applications.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: 'Active listings', value: jobs.length },
          { icon: Users, label: 'Total applicants', value: applications.length },
          { icon: TrendingUp, label: 'Pending review', value: pending },
          { icon: CheckCircle, label: 'Hired', value: hired },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <s.icon size={16} className="text-stone-400 mb-2" />
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Active listings */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Active listings</h3>
            <Link href="/post-job" className="btn-primary !py-1.5 !px-3 text-xs">+ Post job</Link>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-stone-400 mb-3">No active listings</p>
              <Link href="/post-job" className="btn-primary text-xs">Post your first job</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between py-2.5 border-b border-stone-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{job.title}</p>
                    <p className="text-xs text-stone-400">{job.country} · {job.type} · {timeAgo(job.created_at)}</p>
                  </div>
                  <span className="text-xs text-stone-400">
                    {applications.filter(a => a.job_id === job.id).length} applicants
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent applicants */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Recent applicants</h3>
            {applications.length > 0 && (
              <Link href="/dashboard/applications" className="flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium">
                View all <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map(app => (
                <Link
                  key={app.id}
                  href="/dashboard/applications"
                  className="flex items-center justify-between py-2 hover:bg-stone-50 rounded-lg px-1 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium">
                      {(app.seeker?.profile?.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-800">{app.seeker?.profile?.full_name || 'Applicant'}</p>
                      <p className="text-xs text-stone-400">{app.job?.title}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
