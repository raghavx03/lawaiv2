// Auto-Blog Generation Engine
// Generates expert-level legal blog posts on trending Indian law topics
// Uses NVIDIA AI to write human-quality content twice daily

import { AIMessage } from './ai-service'

// Trending legal topics pool — rotated daily
const TRENDING_TOPIC_POOLS = [
    // AI & Legal Tech
    {
        category: 'Legal Tech', topics: [
            'How AI is Revolutionizing Legal Research in Indian Courts',
            'Can AI Replace Junior Advocates? The Truth About Legal AI',
            'AI-Powered Case Prediction: How Machine Learning Reads Court Trends',
            'Digital Evidence in Indian Courts: Admissibility Under Section 65B IT Act',
            'How Smart Contracts Are Changing Commercial Law in India',
        ]
    },
    // Criminal Law
    {
        category: 'Criminal Law', topics: [
            'New BNS 2023: Key Changes Every Advocate Must Know',
            'Bail Reform Under BNSS: What Changed From CrPC',
            'Cybercrime Investigation in India: Legal Framework and Challenges',
            'Anticipatory Bail: Latest Supreme Court Guidelines 2024',
            'FIR Filing Rights: What Every Citizen Should Know',
        ]
    },
    // Civil & Property
    {
        category: 'Civil Law', topics: [
            'Property Disputes in India: How AI Can Speed Up Resolution',
            'RERA Complaints: Step-by-Step Legal Guide for Homebuyers',
            'Tenant Rights Under New Rental Laws: State-Wise Analysis',
            'Partition Suits: Legal Procedure and Timeline in Indian Courts',
            'Consumer Protection Act 2019: Filing Complaints Online',
        ]
    },
    // Family Law
    {
        category: 'Family Law', topics: [
            'Divorce Procedure in India: Mutual vs Contested',
            'Maintenance Rights: Section 125 CrPC vs Hindu Adoption Act',
            'Child Custody Laws: Best Interest of Child Doctrine in India',
            'Domestic Violence Act: Protection Orders and Legal Remedies',
            'Live-in Relationship Rights: Supreme Court Rulings Explained',
        ]
    },
    // Business & Corporate
    {
        category: 'Corporate Law', topics: [
            'Startup Legal Checklist: Company Registration to Compliance',
            'GST Compliance: Common Mistakes Small Businesses Make',
            'Intellectual Property Protection for Indian Startups',
            'Employment Law Basics: Hire, Fire, and Legal Obligations',
            'MSME Registration Benefits: Legal Advantages You Are Missing',
        ]
    },
    // Constitutional & Rights
    {
        category: 'Constitutional Law', topics: [
            'Right to Privacy After Puttaswamy: Current Legal Position',
            'Freedom of Speech on Social Media: Legal Boundaries in India',
            'RTI Applications: How to Draft and File Effectively',
            'PIL Filing Guide: When and How to Approach High Courts',
            'Reservation Laws in India: Latest Constitutional Amendments',
        ]
    },
    // Pain Points for Advocates
    {
        category: 'Practice Management', topics: [
            'How AI Saves 5 Hours Daily for Indian Lawyers',
            'Client Management for Solo Practitioners: Digital Tools Guide',
            'Legal Notice Drafting: Common Mistakes That Cost You Cases',
            'Court Hearing Preparation: AI-Powered Research Workflow',
            'Case Tracking Automation: Never Miss a Hearing Date Again',
        ]
    },
]

export interface AutoBlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string
    category: string
    author: string
    readTime: string
    publishedAt: string
    tags: string[]
    aiGenerated: boolean
}

// In-memory store for generated blogs (persists until server restart)
// In production, this should be backed by a database
let generatedBlogs: AutoBlogPost[] = []

export function getGeneratedBlogs(): AutoBlogPost[] {
    return generatedBlogs
}

export function addGeneratedBlog(post: AutoBlogPost): void {
    // Keep max 30 posts (15 days worth)
    if (generatedBlogs.length >= 30) {
        generatedBlogs = generatedBlogs.slice(-29)
    }
    generatedBlogs.unshift(post)
}

// Pick trending topics based on date (deterministic rotation)
export function getTrendingTopics(count: number = 2): { category: string; topic: string }[] {
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

    const selected: { category: string; topic: string }[] = []

    for (let i = 0; i < count; i++) {
        const poolIndex = (dayOfYear + i) % TRENDING_TOPIC_POOLS.length
        const pool = TRENDING_TOPIC_POOLS[poolIndex]
        const topicIndex = (dayOfYear + i) % pool.topics.length
        selected.push({
            category: pool.category,
            topic: pool.topics[topicIndex]
        })
    }

    return selected
}

// Generate a slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
}

// Build the AI prompt for blog generation
export function buildBlogPrompt(topic: string, category: string): AIMessage[] {
    return [
        {
            role: 'system',
            content: `You are a Senior Legal Expert and Content Writer specializing in Indian law. You write for LAW.AI blog — a platform that helps Indian lawyers and citizens with AI-powered legal tools.

WRITING STYLE & AEO (Answer Engine Optimization):
- **DIRECT ANSWER BLOCK**: Start with a 50-word direct, factual answer to the query/topic. This is for Google's Featured Snippet.
- **STRUCTURE**: Use clear H2 and H3 headings.
- **TONE**: Professional, authoritative, yet accessible Indian legal expert.
- **CITATIONS**: Use real Indian legal examples, case names (e.g., *State vs. X*), and specific Sections (e.g., Section 420 IPC).
- **PRACTICALITY**: Make it actionable. What should the reader DO?
- **LENGTH**: 1500-2000 words.

MANDATORY SECTIONS:
1. **Direct Answer** (First paragraph, bold key terms)
2. **Introduction**
3. **Legal Framework** (Acts, Sections)
4. **Key Takeaways** (Bulleted list)
5. **How LAW.AI Helps** (Explain how our AI tools specifically solve this)
6. **Recent Supreme Court Judgments** (Real case laws)
7. **FAQ Section** (At least 5 questions with clear answers for Schema)
8. **Conclusion & CTA**

FORMATTING rules:
- Use proper markdown (##, ###, -)
- Do NOT use **asterisks** for bolding logic excessively, use them only for key terms.
- No pre-text or post-text. Return ONLY the markdown.`
        },
        {
            role: 'user',
            content: `Write an expert-level blog post on: "${topic}"
Category: ${category}
Make it SEO-optimized for Indian legal searches. Include real Indian law citations.`
        }
    ]
}

// Estimate read time from content
export function estimateReadTime(content: string): string {
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / 200)
    return `${minutes} min read`
}

// Generate a unique ID
export function generateBlogId(): string {
    return `auto-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}
