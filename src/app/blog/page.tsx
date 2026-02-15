import Link from 'next/link'
import { Metadata } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { getGeneratedBlogs } from '@/lib/auto-blog'
import { Calendar, Clock, User, ArrowRight, Sparkles } from 'lucide-react'
import { LegalFooter } from '@/components/landing/legal-footer'

export const metadata: Metadata = {
    title: 'Legal Tech Blog | LAW.AI',
    description: 'Latest insights on AI in law, legal drafting tips, case tracking guides, and Indian legal technology trends.',
    openGraph: {
        title: 'Legal Tech Blog | LAW.AI',
        description: 'Expert insights for the modern Indian lawyer.',
        type: 'website',
    }
}

export default function BlogIndex() {
    // Merge static + auto-generated blogs
    const autoBlogs = getGeneratedBlogs()
    const autoBlogCards = autoBlogs.map(ab => ({
        slug: ab.slug,
        title: ab.title,
        description: ab.excerpt,
        category: ab.category,
        readTime: ab.readTime,
        author: ab.author,
        date: new Date(ab.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        isAuto: true
    }))

    const staticBlogCards = blogPosts.map(bp => ({
        ...bp,
        isAuto: false
    }))

    // Auto-generated blogs first (newest), then static
    const allPosts = [...autoBlogCards, ...staticBlogCards]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            Legal Tech Insights
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                            Expert guides, industry trends, and practical tips for Indian legal professionals embracing AI.
                        </p>
                        {autoBlogs.length > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-sm text-green-700 dark:text-green-400">
                                <Sparkles className="w-4 h-4" />
                                <span>{autoBlogs.length} AI-generated articles today</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {allPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                            <div className="h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                                {post.category}
                                            </span>
                                            {post.isAuto && (
                                                <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> AI
                                                </span>
                                            )}
                                        </div>
                                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {post.readTime}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                                        {post.description}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="ml-2">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white">{post.author}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <LegalFooter />
        </div>
    )
}
