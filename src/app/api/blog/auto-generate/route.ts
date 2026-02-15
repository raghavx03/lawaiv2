export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import {
    getTrendingTopics,
    buildBlogPrompt,
    estimateReadTime,
    generateBlogId,
    addGeneratedBlog,
    getGeneratedBlogs,
    AutoBlogPost
} from '@/lib/auto-blog'

// Secret key to prevent unauthorized blog generation
const CRON_SECRET = process.env.CRON_SECRET || 'lawai-auto-blog-2024'

// GET: Fetch all auto-generated blogs
export async function GET() {
    const blogs = getGeneratedBlogs()
    return NextResponse.json({
        ok: true,
        count: blogs.length,
        posts: blogs
    })
}

// POST: Trigger auto-blog generation
export async function POST(request: NextRequest) {
    try {
        // Simple auth check
        const body = await request.json().catch(() => ({}))
        const secret = body.secret || request.headers.get('x-cron-secret')

        if (secret !== CRON_SECRET && process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
        }

        const count = body.count || 2 // Default: 2 blogs per trigger
        const topics = getTrendingTopics(count)
        const results: AutoBlogPost[] = []

        // Check if we already generated blogs today
        const existingBlogs = getGeneratedBlogs()
        const today = new Date().toISOString().split('T')[0]
        const todayBlogs = existingBlogs.filter(b => b.publishedAt.startsWith(today))

        if (todayBlogs.length >= 4) {
            return NextResponse.json({
                ok: true,
                message: 'Already generated maximum blogs for today',
                todayCount: todayBlogs.length
            })
        }

        for (const { category, topic } of topics) {
            try {
                const messages = buildBlogPrompt(topic, category)

                // Use NVIDIA AI
                const { callAIService } = await import('@/lib/ai-service')
                const aiResponse = await callAIService(messages, 'PRO', 4096, 0.8)

                if (!aiResponse.content) {
                    console.warn(`[Auto-Blog] No content generated for: ${topic}`)
                    continue
                }

                const slug = topic
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .slice(0, 80)

                const post: AutoBlogPost = {
                    id: generateBlogId(),
                    slug,
                    title: topic,
                    excerpt: aiResponse.content.substring(0, 200).replace(/[#\n]/g, ' ').trim() + '...',
                    content: aiResponse.content,
                    category,
                    author: 'LAW.AI Editorial Team',
                    readTime: estimateReadTime(aiResponse.content),
                    publishedAt: new Date().toISOString(),
                    tags: [category.toLowerCase(), 'indian-law', 'legal-tech', 'ai-legal'],
                    aiGenerated: true
                }

                addGeneratedBlog(post)
                results.push(post)

                console.log(`[Auto-Blog] Generated: "${topic}" (${post.readTime})`)
            } catch (topicError) {
                console.error(`[Auto-Blog] Failed to generate "${topic}":`, topicError)
            }
        }

        return NextResponse.json({
            ok: true,
            generated: results.length,
            posts: results.map(p => ({ id: p.id, title: p.title, slug: p.slug, category: p.category })),
            message: `Generated ${results.length} blog posts successfully`
        })
    } catch (error) {
        console.error('[Auto-Blog] Generation error:', error)
        return NextResponse.json({
            ok: false,
            message: error instanceof Error ? error.message : 'Blog generation failed'
        }, { status: 500 })
    }
}
