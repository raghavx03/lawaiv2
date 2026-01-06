import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lawai.in'
  const currentDate = new Date().toISOString()

  // Main pages
  const mainPages = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/founder`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.6 },
  ]

  // Auth pages
  const authPages = [
    { url: `${baseUrl}/auth/login`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/auth/signup`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.9 },
  ]

  // Feature pages (high priority for SEO)
  const featurePages = [
    { url: `${baseUrl}/ai-assistant`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/drafts`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/summarizer`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/case-tracker`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/research`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/crm`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/notices`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/acts`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.8 },
  ]

  // SEO Landing pages
  const seoPages = [
    { url: `${baseUrl}/indian-law-ai`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
  ]

  // Blog pages
  const blogPages = [
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/blog/ai-legal-assistant`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/document-drafting-guide`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/case-tracking-cnr`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/legal-research-tips`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/client-management-crm`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/legal-notices-guide`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/judgment-summarization`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog/staying-updated-legal-news`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.7 },
  ]

  // Help pages
  const helpPages = [
    { url: `${baseUrl}/help/user-guide`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/help/tutorials`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/help/community`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // Legal pages
  const legalPages = [
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return [
    ...mainPages,
    ...authPages,
    ...featurePages,
    ...seoPages,
    ...blogPages,
    ...helpPages,
    ...legalPages,
  ]
}
