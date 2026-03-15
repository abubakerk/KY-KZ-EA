export type UserRole = 'seeker' | 'employer'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface SeekerProfile {
  id: string
  user_id: string
  headline: string | null
  summary: string | null
  cv_url: string | null
  cv_filename: string | null
  location: string | null
  skills: string[]
  experience_years: number | null
  linkedin_url: string | null
  portfolio_url: string | null
}

export interface EmployerProfile {
  id: string
  user_id: string
  company_name: string
  company_logo_url: string | null
  industry: string | null
  company_size: string | null
  website: string | null
  description: string | null
  verified: boolean
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship'

export type JobCategory =
  | 'tech' | 'finance' | 'health' | 'ngo' | 'education'
  | 'agriculture' | 'logistics' | 'hospitality' | 'construction'
  | 'media' | 'legal' | 'hr' | 'sales' | 'manufacturing'
  | 'energy' | 'transport' | 'banking' | 'government' | 'other'

export type JobStatus = 'active' | 'closed' | 'draft'
export type Country = 'Kenya' | 'Uganda' | 'Tanzania' | 'Rwanda' | 'Ethiopia'

export interface Job {
  id: string
  employer_id: string
  title: string
  description: string
  requirements: string | null
  responsibilities: string | null
  country: Country
  city: string | null
  type: JobType
  category: JobCategory
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  experience_years_min: number | null
  status: JobStatus
  is_featured: boolean
  application_deadline: string | null
  created_at: string
  updated_at: string
  employer?: EmployerProfile
  _count?: { applications: number }
  is_saved?: boolean
}

export interface Application {
  id: string
  job_id: string
  seeker_id: string
  cover_letter: string | null
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
  created_at: string
  job?: Job
  seeker?: SeekerProfile & { profile: Profile }
}

export interface SavedJob {
  id: string
  user_id: string
  job_id: string
  created_at: string
  job?: Job
}

export interface JobFilters {
  query?: string
  country?: Country | ''
  category?: JobCategory | ''
  type?: JobType | ''
  salary_min?: number
  page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  totalPages: number
}
