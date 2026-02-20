'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast, Toaster } from 'react-hot-toast'
import { Users, Plus, Phone, Mail, Calendar, Clock, Target, Search, X, Loader2, Trash2 } from 'lucide-react'
import { PremiumButton, PremiumCard, StatCard } from '@/components/premium'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  notes: string
  createdAt: string
}

interface Appointment {
  id: string
  clientName: string
  date: string
  time: string
  type: string
  status: string
  title?: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  dueDate: string
  clientName?: string
}

export default function CRMPage() {
  const { user, profile } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('contacts')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    date: '',
    time: '',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/crm/supabase')
      const data = await response.json()
      
      if (response.ok && data.ok) {
        setContacts(data.contacts || [])
        setAppointments(data.appointments || [])
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('CRM fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (activeTab === 'contacts' && !formData.name.trim()) {
      toast.error('Please enter contact name')
      return
    }
    if (activeTab === 'appointments' && (!formData.name.trim() || !formData.date || !formData.time)) {
      toast.error('Please fill all required fields')
      return
    }
    if (activeTab === 'tasks' && (!formData.title.trim() || !formData.dueDate)) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      let body = {}
      if (activeTab === 'contacts') {
        body = {
          type: 'contact',
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          notes: formData.notes.trim() || undefined
        }
      } else if (activeTab === 'appointments') {
        body = {
          type: 'appointment',
          clientName: formData.name.trim(),
          date: formData.date,
          time: formData.time,
          title: formData.title.trim() || 'Meeting',
          description: formData.description.trim() || undefined
        }
      } else if (activeTab === 'tasks') {
        body = {
          type: 'task',
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          dueDate: formData.dueDate,
          clientName: formData.name.trim() || undefined
        }
      }

      const response = await fetch('/api/crm/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success(`${activeTab === 'contacts' ? 'Contact' : activeTab === 'appointments' ? 'Appointment' : 'Task'} added!`)
        setFormData({ name: '', email: '', phone: '', notes: '', date: '', time: '', title: '', description: '', priority: 'medium', dueDate: '' })
        setShowAddForm(false)
        fetchData()
      } else {
        const result = await response.json()
        toast.error(result.message || 'Failed to save')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Something went wrong')
    }
  }

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  )

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-premium-h1 text-slate-900 dark:text-white">Client Management</h1>
          <p className="text-premium-body text-slate-600 dark:text-slate-400 mt-1">Manage clients, appointments, and tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
            {profile?.plan || 'FREE'} Plan
          </span>
          <PremiumButton 
            onClick={() => setShowAddForm(true)}
            variant="primary"
            size="md"
            icon={<Plus className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Add {activeTab === 'contacts' ? 'Contact' : activeTab === 'appointments' ? 'Appointment' : 'Task'}</span>
            <span className="sm:hidden">Add</span>
          </PremiumButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { icon: <Users className="h-5 w-5" />, label: 'Clients', value: contacts.length },
          { icon: <Calendar className="h-5 w-5" />, label: 'Appointments', value: appointments.length },
          { icon: <Target className="h-5 w-5" />, label: 'Tasks', value: tasks.length },
          { icon: <Clock className="h-5 w-5" />, label: 'Pending', value: tasks.filter(t => t.status !== 'completed').length }
        ].map((stat) => (
          <StatCard 
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color="indigo"
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'tasks', label: 'Tasks', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab === 'contacts' && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PremiumCard className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-premium-h2 text-slate-900 dark:text-white">
                Add {activeTab === 'contacts' ? 'Contact' : activeTab === 'appointments' ? 'Appointment' : 'Task'}
              </h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'contacts' && (
                <>
                  <div>
                    <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Name *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@email.com"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                      <input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm resize-none"
                    />
                  </div>
                </>
              )}

              {activeTab === 'appointments' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Client Name *</label>
                      <input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Client name"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                      <input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Meeting title"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Time *</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Meeting details..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm resize-none"
                    />
                  </div>
                </>
              )}

              {activeTab === 'tasks' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Task Title *</label>
                      <input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Task title"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Client (Optional)</label>
                      <input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Client name"
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Due Date *</label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-premium-body text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Task details..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <PremiumButton 
                  onClick={() => setShowAddForm(false)} 
                  variant="ghost"
                  size="md"
                  className="flex-1"
                >
                  Cancel
                </PremiumButton>
                <PremiumButton 
                  onClick={handleSubmit} 
                  variant="primary"
                  size="md"
                  className="flex-1"
                >
                  Save
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <PremiumCard key={contact.id} hoverable>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/30 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{contact.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{contact.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{contact.email}</span>
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {contact.notes && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{contact.notes}</p>
                    )}
                  </PremiumCard>
                ))
              ) : (
                <PremiumCard hoverable={false}>
                  <div className="text-center py-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                    </div>
                    <h3 className="text-premium-h3 text-slate-900 dark:text-white mb-2">No contacts yet</h3>
                    <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-4">Add your first client contact</p>
                    <PremiumButton onClick={() => setShowAddForm(true)} variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
                      Add Contact
                    </PremiumButton>
                  </div>
                </PremiumCard>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <PremiumCard key={apt.id} hoverable>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl">
                          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{apt.clientName}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{apt.title || apt.type || 'Meeting'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-white">{apt.date}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{apt.time}</p>
                      </div>
                    </div>
                  </PremiumCard>
                ))
              ) : (
                <PremiumCard hoverable={false}>
                  <div className="text-center py-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                    </div>
                    <h3 className="text-premium-h3 text-slate-900 dark:text-white mb-2">No appointments</h3>
                    <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-4">Schedule your first appointment</p>
                    <PremiumButton onClick={() => setShowAddForm(true)} variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
                      Add Appointment
                    </PremiumButton>
                  </div>
                </PremiumCard>
              )}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <PremiumCard key={task.id} hoverable>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/30 rounded-xl">
                          <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{task.title}</h3>
                          {task.clientName && <p className="text-sm text-slate-500 dark:text-slate-400">Client: {task.clientName}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                          task.priority === 'high' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400' :
                          task.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                          'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{task.dueDate}</span>
                      </div>
                    </div>
                    {task.description && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                    )}
                  </PremiumCard>
                ))
              ) : (
                <PremiumCard hoverable={false}>
                  <div className="text-center py-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                    </div>
                    <h3 className="text-premium-h3 text-slate-900 dark:text-white mb-2">No tasks</h3>
                    <p className="text-premium-body text-slate-600 dark:text-slate-400 mb-4">Create your first task</p>
                    <PremiumButton onClick={() => setShowAddForm(true)} variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
                      Add Task
                    </PremiumButton>
                  </div>
                </PremiumCard>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
