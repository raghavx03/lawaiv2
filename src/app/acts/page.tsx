'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Search, Book, FileText, ChevronRight, Loader2, Eye, X, Bookmark, BookmarkCheck } from 'lucide-react'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'

interface Act {
  id: string
  title: string
  year: string
  actId: string
  sectionsCount: number
  description: string
  sections?: Section[]
}

interface Section {
  number: string
  title: string
  content: string
}

const mockActs: Act[] = [
  {
    id: '1',
    title: 'Indian Penal Code',
    year: '1860',
    actId: 'IPC-1860',
    sectionsCount: 511,
    description: 'The main criminal code of India covering all substantive aspects of criminal law',
    sections: [
      { number: '302', title: 'Punishment for murder', content: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.' },
      { number: '420', title: 'Cheating and dishonestly inducing delivery of property', content: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property...' },
      { number: '498A', title: 'Cruelty by husband or relatives', content: 'Whoever, being the husband or the relative of the husband of a woman, subjects such woman to cruelty...' }
    ]
  },
  {
    id: '2',
    title: 'Code of Criminal Procedure',
    year: '1973',
    actId: 'CrPC-1973',
    sectionsCount: 484,
    description: 'Procedural law for administration of substantive criminal law in India',
    sections: [
      { number: '41', title: 'When police may arrest without warrant', content: 'Any police officer may without an order from a Magistrate and without a warrant, arrest any person...' },
      { number: '154', title: 'Information in cognizable cases', content: 'Every information relating to the commission of a cognizable offence...' }
    ]
  },
  {
    id: '3',
    title: 'Indian Contract Act',
    year: '1872',
    actId: 'ICA-1872',
    sectionsCount: 266,
    description: 'Governs the law relating to contracts in India'
  },
  {
    id: '4',
    title: 'Indian Evidence Act',
    year: '1872',
    actId: 'IEA-1872',
    sectionsCount: 167,
    description: 'Rules of evidence in Indian courts'
  },
  {
    id: '5',
    title: 'Constitution of India',
    year: '1950',
    actId: 'COI-1950',
    sectionsCount: 395,
    description: 'Supreme law of India establishing fundamental rights and duties'
  },
  {
    id: '6',
    title: 'Companies Act',
    year: '2013',
    actId: 'CA-2013',
    sectionsCount: 470,
    description: 'Regulates incorporation, responsibilities and dissolution of companies'
  },
  {
    id: '7',
    title: 'Negotiable Instruments Act',
    year: '1881',
    actId: 'NIA-1881',
    sectionsCount: 147,
    description: 'Deals with promissory notes, bills of exchange and cheques'
  },
  {
    id: '8',
    title: 'Consumer Protection Act',
    year: '2019',
    actId: 'CPA-2019',
    sectionsCount: 107,
    description: 'Protects consumer rights and provides for redressal of grievances'
  }
]

export default function ActsExplorerPage() {
  const { user, profile } = useAuth()
  const [acts, setActs] = useState<Act[]>([])
  const [filteredActs, setFilteredActs] = useState<Act[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedAct, setSelectedAct] = useState<Act | null>(null)
  const [savedActs, setSavedActs] = useState<string[]>([])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setActs(mockActs)
      setFilteredActs(mockActs)
      setLoading(false)
    }, 500)
    
    // Load saved acts from localStorage
    const saved = localStorage.getItem('savedActs')
    if (saved) setSavedActs(JSON.parse(saved))
  }, [])

  useEffect(() => {
    let filtered = acts

    if (searchQuery) {
      filtered = filtered.filter(act =>
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.actId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedYear) {
      filtered = filtered.filter(act => act.year === selectedYear)
    }

    setFilteredActs(filtered)
  }, [searchQuery, selectedYear, acts])

  const years = [...new Set(acts.map(act => act.year))].sort()

  const toggleSaveAct = (id: string) => {
    const newSaved = savedActs.includes(id)
      ? savedActs.filter(a => a !== id)
      : [...savedActs, id]
    setSavedActs(newSaved)
    localStorage.setItem('savedActs', JSON.stringify(newSaved))
    toast.success(savedActs.includes(id) ? 'Removed from saved' : 'Act saved')
  }

  const viewAct = (act: Act) => {
    setSelectedAct(act)
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-premium-h1 text-slate-900 dark:text-white">Acts Explorer</h1>
          <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-1">Browse Indian legal acts and sections</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'} Plan
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total Acts', value: acts.length },
          { label: 'Total Sections', value: acts.reduce((sum, act) => sum + act.sectionsCount, 0).toLocaleString() },
          { label: 'Saved', value: savedActs.length }
        ].map((stat) => (
          <StatCard 
            key={stat.label}
            label={stat.label}
            value={stat.value}
            color="indigo"
          />
        ))}
      </div>

      {/* Viewing Act Details */}
      {selectedAct && (
        <PremiumCard className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-premium-h2 text-slate-900 dark:text-white">{selectedAct.title}</h2>
              <p className="text-premium-body text-slate-600 dark:text-slate-400">{selectedAct.actId} • {selectedAct.year}</p>
            </div>
            <button onClick={() => setSelectedAct(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{selectedAct.description}</p>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg">
              {selectedAct.sectionsCount} Sections
            </span>
            <button
              onClick={() => toggleSaveAct(selectedAct.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs ${
                savedActs.includes(selectedAct.id)
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {savedActs.includes(selectedAct.id) ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
              {savedActs.includes(selectedAct.id) ? 'Saved' : 'Save'}
            </button>
          </div>

          {selectedAct.sections && selectedAct.sections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">Key Sections</h3>
              {selectedAct.sections.map((section) => (
                <div key={section.number} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 text-xs font-medium rounded">
                      Section {section.number}
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{section.title}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{section.content}</p>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      )}

      {/* Search and Filter */}
      <PremiumCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search acts..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </PremiumCard>

      {/* Acts Grid */}
      {filteredActs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredActs.map((act) => (
            <PremiumCard key={act.id} hoverable>
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-lg">
                    {act.year}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSaveAct(act.id); }}
                    className={`p-1.5 rounded-lg ${
                      savedActs.includes(act.id) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                    }`}
                  >
                    {savedActs.includes(act.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <h3 className="text-base font-medium text-slate-900 dark:text-white mb-2">
                {act.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {act.description}
              </p>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Book className="h-3.5 w-3.5 mr-1" />
                  {act.sectionsCount} sections
                </span>
                <PremiumButton
                  onClick={() => viewAct(act)}
                  variant="primary"
                  size="sm"
                  icon={<ChevronRight className="h-3 w-3" />}
                >
                  View
                </PremiumButton>
              </div>
            </PremiumCard>
          ))}
        </div>
      ) : (
        <PremiumCard hoverable={false}>
          <div className="text-center py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Book className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-premium-h3 text-slate-900 dark:text-white mb-2">No acts found</h3>
            <p className="text-premium-body text-slate-600 dark:text-slate-400">Try adjusting your search or filters</p>
          </div>
        </PremiumCard>
      )}

      {/* Features */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4 text-center">Database Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Comprehensive Coverage', description: 'Complete collection of Indian legal acts' },
            { title: 'Advanced Search', description: 'Search across titles, descriptions, and sections' },
            { title: 'Detailed Information', description: 'Sections, amendments, and related cases' }
          ].map((feature) => (
            <PremiumCard key={feature.title} hoverable={false}>
              <div className="text-center">
                <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>
    </div>
  )
}
