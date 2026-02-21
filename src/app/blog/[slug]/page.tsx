import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts, BlogPost } from '@/lib/blog-data'
import { getGeneratedBlogs } from '@/lib/auto-blog'
import { ChevronLeft, Calendar, User, Clock, Share2, Sparkles } from 'lucide-react'
import { LegalFooter } from '@/components/landing/legal-footer'

interface Props {
    params: { slug: string }
}

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}

export function generateMetadata({ params }: Props): Metadata {
    const post = blogPosts.find((p) => p.slug === params.slug)
    const autoPost = !post ? getGeneratedBlogs().find(p => p.slug === params.slug) : null

    if (!post && !autoPost) return { title: 'Post Not Found' }

    const title = post?.title || autoPost?.title || ''
    const description = post?.description || autoPost?.excerpt || ''

    return {
        title: `${title} | LAW.AI Blog`,
        description,
        openGraph: {
            type: 'article',
        }
    }
}

// Simple markdown to HTML converter for auto-generated posts
function markdownToHtml(md: string): string {
    return md
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold & Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Wrap in paragraphs
        .replace(/^(?!<[hlu])/gim, '')
        // Line breaks
        .replace(/\n/g, '<br/>')
}

export default function BlogPostPage({ params }: Props) {
    const staticPost = blogPosts.find((p) => p.slug === params.slug)
    const autoPost = !staticPost ? getGeneratedBlogs().find(p => p.slug === params.slug) : null

    if (!staticPost && !autoPost) {
        notFound()
    }

    const isAuto = !!autoPost
    const title = staticPost?.title || autoPost?.title || ''
    const category = staticPost?.category || autoPost?.category || ''
    const author = staticPost?.author || autoPost?.author || ''
    const date = staticPost?.date || (autoPost ? new Date(autoPost.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '')
    const readTime = staticPost?.readTime || autoPost?.readTime || ''
    const tags = staticPost?.tags || autoPost?.tags || []
    const content = staticPost?.content || (autoPost ? markdownToHtml(autoPost.content) : '')

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Navigation */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/blog" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Blog
                    </Link>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] hidden sm:block">
                        {title}
                    </span>
                    <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            {category}
                        </span>
                        {isAuto && (
                            <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI Generated
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        {title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            {author}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {date}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {readTime}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div
                    className="prose prose-lg dark:prose-invert mx-auto prose-green prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-md">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </article>

            {/* CTA */}
            <div className="bg-gray-50 dark:bg-gray-800/50 py-16 mt-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to streamline your legal practice?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Join thousands of Indian lawyers using LAW.AI to work smarter.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:text-lg md:px-10 transition-all shadow-lg hover:shadow-xl"
                    >
                        Start Free Trial
                    </Link>
                </div>
            </div>

            <LegalFooter />
        </div>
    )
}
