'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { COUNTRIES, CATEGORIES, JOB_TYPES } from '@/lib/utils'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    update('q', query)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Job title, skill, keyword..."
            className="input-base pl-9 pr-4"
          />
        </div>
      </form>

      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block">Country</label>
        <select
          value={searchParams.get('country') || ''}
          onChange={e => update('country', e.target.value)}
          className="input-base">
          <option value="">All countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block">Category</label>
        <select
          value={searchParams.get('category') || ''}
          onChange={e => update('category', e.target.value)}
          className="input-base">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block">Job type</label>
        <div className="flex flex-col gap-1.5">
          {JOB_TYPES.map(t => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="type"
                value={t.value}
                checked={searchParams.get('type') === t.value}
                onChange={() => update('type', t.value)}
                className="accent-emerald-600"
              />
              <span className="text-sm text-stone-700 group-hover:text-stone-900">{t.label}</span>
            </label>
          ))}
          {searchParams.get('type') && (
            <button onClick={() => update('type', '')} className="text-xs text-emerald-600 hover:text-emerald-800 text-left mt-1">
              Clear filter
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5 block">Min salary (USD/mo)</label>
        <select
          value={searchParams.get('salary_min') || ''}
          onChange={e => update('salary_min', e.target.value)}
          className="input-base">
          <option value="">Any</option>
          <option value="500">$500+</option>
          <option value="1000">$1,000+</option>
          <option value="2000">$2,000+</option>
          <option value="3000">$3,000+</option>
          <option value="5000">$5,000+</option>
        </select>
      </div>
    </div>
  )
}
