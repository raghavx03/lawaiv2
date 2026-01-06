'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Share2, BookmarkPlus } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

const blogPosts: Record<string, any> = {
  'ai-legal-assistant': {
    title: 'How AI is Revolutionizing Legal Practice in India',
    excerpt: 'Discover how artificial intelligence is transforming the way lawyers work.',
    content: `The legal profession in India is undergoing a massive transformation. With over 1.7 million advocates registered with the Bar Council of India, the competition is fierce, and efficiency is key to success.

Artificial Intelligence is no longer a futuristic concept—it's here, and it's changing how lawyers work every single day. From automating routine tasks to providing instant legal research, AI is becoming an indispensable tool for modern legal practitioners.

Why AI Matters for Indian Lawyers

The Indian legal system is one of the most complex in the world, with multiple layers of legislation, countless precedents, and an ever-growing body of case law. Manually researching through this vast repository of legal knowledge is time-consuming and often inefficient.

AI-powered tools like LawAI can analyze thousands of documents in seconds, identify relevant case laws, and even predict case outcomes based on historical data. This isn't about replacing lawyers—it's about empowering them to do their best work.

Key Benefits of AI in Legal Practice

1. Time Savings: What used to take hours of research can now be done in minutes
2. Accuracy: AI reduces human error in document review and legal research
3. Cost Efficiency: Lower operational costs mean better pricing for clients
4. 24/7 Availability: AI assistants work round the clock, never taking a break

The Future is Now

Law firms that embrace AI technology today will have a significant competitive advantage tomorrow. LawAI is designed specifically for Indian lawyers, understanding the nuances of Indian law and providing solutions that actually work in our legal ecosystem.

Start your journey with AI-powered legal assistance today with LawAI's 7-day free trial.`,
    image: '🤖',
    category: 'AI & Technology',
    author: 'LawAI Team',
    date: '2026-01-05',
    readTime: '5 min read'
  },
  'document-drafting-guide': {
    title: 'The Complete Guide to AI-Powered Document Drafting',
    excerpt: 'Learn how to create professional legal documents in minutes using AI.',
    content: `Document drafting is one of the most time-consuming tasks for any lawyer. Whether it's a simple rental agreement or a complex partnership deed, the process of creating legally sound documents requires attention to detail and extensive knowledge.

The Traditional Challenge

Traditionally, lawyers would spend hours drafting documents from scratch or modifying templates. This process is not only time-consuming but also prone to errors. A single mistake in a legal document can have serious consequences for your client.

Enter AI-Powered Drafting

LawAI's Document Generator uses advanced AI to create professional legal documents in minutes. Simply select the document type, fill in the required details, and let AI do the heavy lifting.

Supported Document Types

• Rental Agreements: Complete with all necessary clauses for Indian tenancy laws
• Employment Contracts: Compliant with Indian labor laws
• NDAs: Protect your client's confidential information
• Sale Deeds: For property transactions
• Partnership Deeds: For business partnerships
• Loan Agreements: With proper interest and repayment terms

Best Practices for AI-Assisted Drafting

1. Always Review: AI generates the draft, but you should always review and customize
2. Provide Complete Information: The more details you provide, the better the output
3. Understand the Context: Know your client's specific needs before generating
4. Keep Templates Updated: Save successful drafts as templates for future use

Why LawAI's Document Generator Stands Out

Our AI is trained specifically on Indian legal documents and understands the nuances of Indian law. The documents generated are not generic templates—they're customized, professional, and legally sound.

Try the Document Generator today and experience the future of legal drafting.`,
    image: '📄',
    category: 'Document Drafting',
    author: 'LawAI Team',
    date: '2026-01-04',
    readTime: '6 min read'
  },
  'case-tracking-cnr': {
    title: 'Mastering Case Tracking: Never Miss a Hearing Again',
    excerpt: 'A comprehensive guide to tracking court cases using CNR numbers.',
    content: `Missing a court hearing can be disastrous for both the lawyer and the client. With multiple cases across different courts, keeping track of hearing dates is a constant challenge.

Understanding CNR Numbers

CNR (Case Number Record) is a unique 16-digit alphanumeric number assigned to each case filed in Indian courts. This number remains constant throughout the life of the case and can be used to track its status.

The Problem with Manual Tracking

Many lawyers still rely on manual methods—diaries, spreadsheets, or memory—to track their cases. This approach is:
• Prone to human error
• Time-consuming to maintain
• Difficult to scale as your practice grows

How LawAI's Case Tracker Works

1. Add Cases: Simply enter the CNR number to start tracking
2. Automatic Updates: Get real-time updates on case status
3. Hearing Reminders: Never miss a hearing with automated alerts
4. Case History: View complete case history at a glance
5. Multi-Court Support: Track cases across all Indian courts

Pro Tips for Effective Case Management

• Organize by Priority: Focus on cases with upcoming hearings
• Set Multiple Reminders: Get alerts 7 days, 3 days, and 1 day before hearings
• Document Everything: Keep notes on each case for quick reference
• Regular Review: Check your case list weekly for any updates

The Benefits of Digital Case Tracking

• Peace of Mind: Know that no case will slip through the cracks
• Better Client Service: Provide instant updates to clients
• Improved Efficiency: Spend less time on administrative tasks
• Professional Image: Show clients you're organized and reliable

Start tracking your cases with LawAI today and experience stress-free case management.`,
    image: '📋',
    category: 'Case Management',
    author: 'LawAI Team',
    date: '2026-01-03',
    readTime: '5 min read'
  },
  'legal-research-tips': {
    title: 'Legal Research Made Easy: AI-Powered Research Techniques',
    excerpt: 'Discover how to conduct comprehensive legal research in minutes.',
    content: `Legal research is the foundation of good legal practice. Whether you're preparing for a case, drafting an opinion, or advising a client, thorough research is essential.

The Challenge of Legal Research in India

India has one of the largest bodies of legal literature in the world:
• 1,000+ Central Acts
• 30,000+ State Acts
• Millions of reported judgments
• Countless legal commentaries and articles

Finding relevant information in this vast ocean of legal knowledge is like finding a needle in a haystack.

Traditional vs. AI-Powered Research

Traditional Method:
• Hours spent in law libraries
• Manual searching through indexes
• Risk of missing relevant precedents
• Limited to available resources

AI-Powered Research:
• Instant results from comprehensive databases
• Natural language queries
• Related cases automatically suggested
• Access to latest judgments

How to Use LawAI for Legal Research

1. Natural Language Queries: Ask questions in plain English or Hindi
2. Section Search: Find specific sections of any Act
3. Case Law Search: Find relevant judgments by topic
4. Cross-References: Discover related laws and precedents

Research Best Practices

• Start Broad, Then Narrow: Begin with general queries, then refine
• Use Multiple Keywords: Try different terms for the same concept
• Check Recent Judgments: Law evolves, stay updated
• Verify Sources: Always cross-check important findings

Transform your legal research with LawAI's AI-powered research assistant.`,
    image: '🔍',
    category: 'Legal Research',
    author: 'LawAI Team',
    date: '2026-01-02',
    readTime: '7 min read'
  },
  'client-management-crm': {
    title: 'Building Strong Client Relationships with Legal CRM',
    excerpt: 'Learn how to manage clients, appointments, and tasks effectively.',
    content: `Client relationships are the lifeblood of any legal practice. Happy clients refer more clients, and effective client management is key to building a successful law firm.

Why Traditional Methods Fall Short

Many lawyers still manage clients using:
• Paper files and folders
• Basic spreadsheets
• Memory and handwritten notes

These methods are inefficient, error-prone, and don't scale well as your practice grows.

The Modern Approach: Legal CRM

A Customer Relationship Management (CRM) system designed for lawyers helps you:
• Keep all client information in one place
• Track communications and meetings
• Manage appointments and deadlines
• Never forget a follow-up

LawAI's CRM Features

Contact Management
• Store client details securely
• Add notes and case history
• Quick search and filter

Appointment Scheduling
• Calendar integration
• Automated reminders
• Meeting notes

Task Management
• Create and assign tasks
• Set priorities and deadlines
• Track completion status

Best Practices for Client Management

1. Respond Promptly: Aim to respond to client queries within 24 hours
2. Document Everything: Keep detailed notes of all interactions
3. Set Expectations: Be clear about timelines and outcomes
4. Regular Updates: Keep clients informed about case progress
5. Personal Touch: Remember important dates and details

Start managing your clients professionally with LawAI's integrated CRM.`,
    image: '👥',
    category: 'Client Management',
    author: 'LawAI Team',
    date: '2026-01-01',
    readTime: '6 min read'
  },
  'legal-notices-guide': {
    title: 'Drafting Effective Legal Notices: A Practical Guide',
    excerpt: 'Master the art of drafting legal notices that get results.',
    content: `A well-drafted legal notice can resolve disputes without litigation. It's often the first step in legal proceedings and sets the tone for what follows.

Types of Legal Notices

1. Payment Default Notice: For recovering unpaid dues
2. Contract Breach Notice: When agreements are violated
3. Termination Notice: For ending contracts or employment
4. Cease and Desist: To stop unauthorized activities
5. Eviction Notice: For property-related matters
6. Legal Demand Notice: General legal demands

Essential Elements of a Legal Notice

Every effective legal notice should include:
• Sender's Details: Name, address, and contact information
• Recipient's Details: Complete address for service
• Subject Matter: Clear statement of the issue
• Facts: Chronological account of events
• Legal Basis: Relevant laws and provisions
• Demand: What you want the recipient to do
• Timeline: Deadline for compliance
• Consequences: What happens if demands aren't met

Common Mistakes to Avoid

• Vague or unclear language
• Missing important facts
• Incorrect legal references
• Unreasonable timelines
• Threatening language without legal basis

How LawAI Helps

LawAI's Notice Generator creates professional legal notices with:
• Proper legal formatting
• Relevant statutory references
• Clear and precise language
• Customizable templates

Generate professional legal notices in minutes with LawAI.`,
    image: '📬',
    category: 'Legal Notices',
    author: 'LawAI Team',
    date: '2025-12-30',
    readTime: '5 min read'
  },
  'judgment-summarization': {
    title: 'AI-Powered Judgment Summarization: Save Hours of Reading',
    excerpt: 'Learn how AI can summarize lengthy judgments in seconds.',
    content: `Reading through lengthy judgments is one of the most time-consuming aspects of legal practice. A single Supreme Court judgment can run into hundreds of pages.

The Reading Challenge

Indian courts produce thousands of judgments every day. Staying updated with relevant case law while managing a busy practice is nearly impossible through traditional reading.

What AI Summarization Offers

LawAI's Judgment Summarizer can:
• Condense 100-page judgments into 2-page summaries
• Extract key legal principles
• Identify ratio decidendi
• Highlight important observations
• List relevant citations

How It Works

1. Upload or Paste: Add the judgment text or upload PDF
2. AI Analysis: Our AI reads and understands the judgment
3. Smart Summary: Get a comprehensive summary in seconds
4. Key Points: Important points highlighted separately

What Gets Summarized

• Facts of the Case: Brief background
• Issues Involved: Legal questions addressed
• Arguments: Key arguments from both sides
• Judgment: The court's decision
• Reasoning: Why the court decided as it did
• Precedents: Cases cited and distinguished

Best Use Cases

• Quick case law research
• Preparing for arguments
• Client briefings
• Legal writing and opinions
• Staying updated with new judgments

Start summarizing judgments instantly with LawAI.`,
    image: '📚',
    category: 'Legal Research',
    author: 'LawAI Team',
    date: '2025-12-28',
    readTime: '5 min read'
  },
  'staying-updated-legal-news': {
    title: 'Staying Updated: Legal News That Matters',
    excerpt: 'How to stay on top of legal developments without information overload.',
    content: `The legal landscape in India is constantly evolving. New judgments, amendments, and policy changes happen every day. Staying updated is crucial but challenging.

The Information Overload Problem

With multiple legal news sources, social media, and official gazettes, lawyers are bombarded with information. Separating signal from noise is a daily struggle.

What LawAI's News Feature Offers

• Curated Content: Only relevant legal news
• Multiple Sources: LiveLaw, Bar & Bench, and more
• Category Filters: Supreme Court, High Court, Policy Changes
• Save for Later: Bookmark important articles
• Daily Digest: Key updates at a glance

News Categories Covered

1. Supreme Court: Landmark judgments and orders
2. High Courts: Important decisions from all High Courts
3. Legal Updates: New laws and amendments
4. Policy Changes: Government notifications
5. Bar News: Updates from Bar Councils

How to Stay Updated Efficiently

• Set a Schedule: Check news at fixed times
• Use Filters: Focus on your practice areas
• Save Important Articles: Build a reference library
• Share with Team: Keep colleagues informed
• Act on Updates: Apply new knowledge to cases

Why Legal News Matters

• Better Advice: Informed lawyers give better counsel
• Competitive Edge: Know what others might miss
• Professional Growth: Continuous learning
• Client Trust: Clients value updated lawyers

Stay informed without the overwhelm with LawAI's curated legal news.`,
    image: '📰',
    category: 'Legal News',
    author: 'LawAI Team',
    date: '2025-12-25',
    readTime: '4 min read'
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = blogPosts[slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Blog</span>
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={shareArticle}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <div className="mb-8">
          <div className="text-5xl mb-6">{post.image}</div>
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Try LawAI?
          </h2>
          <p className="text-gray-600 mb-6">
            Experience the features discussed in this article with our 7-day free trial.
          </p>
          <Link 
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(blogPosts)
              .filter(([key]) => key !== slug)
              .slice(0, 2)
              .map(([key, relatedPost]: [string, any]) => (
                <Link 
                  key={key}
                  href={`/blog/${key}`}
                  className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <span className="text-2xl mb-2 block">{relatedPost.image}</span>
                  <h4 className="font-medium text-gray-900 mb-1">{relatedPost.title}</h4>
                  <p className="text-sm text-gray-500">{relatedPost.readTime}</p>
                </Link>
              ))}
          </div>
        </div>
      </main>

    </div>
  )
}
