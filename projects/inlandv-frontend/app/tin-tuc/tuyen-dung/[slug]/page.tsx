import { notFound } from 'next/navigation'
import JobDetailHero from '@/components/careers/JobDetailHero'
import JobDetailContent from '@/components/careers/JobDetailContent'
import JobApplyForm from '@/components/careers/JobApplyForm'
import { api } from '@/lib/api'
import { mapJobToJobPosting } from '@/lib/newsUtils'

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export default async function JobDetailPage({ params }: PageProps) {
  // Handle both Promise and direct params
  const resolvedParams = params instanceof Promise ? await params : params
  
  try {
    // Fetch job by slug from API
    const response = await api.getJobBySlug(resolvedParams.slug)
    
    if (!response.success || !response.data) {
      notFound()
    }

    const job = mapJobToJobPosting(response.data)

    return (
      <div className="min-h-screen bg-white">
        <div className="h-20" />
        
        <JobDetailHero job={job} />
        
        <JobDetailContent job={job} />
        
        <JobApplyForm jobTitle={job.title} />
        
        <div className="h-16" />
      </div>
    )
  } catch (error) {
    console.error('Error fetching job:', error)
    notFound()
  }
}

