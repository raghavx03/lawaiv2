'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Phone, Mail, Calendar, User, Clock, TrendingUp, Target, UserPlus, MessageSquare, Menu, X, Search, Filter, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'
import { FeatureModal } from '@/components/auth/FeatureModal'


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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
}

function CRMContent() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('contacts')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  )

  const fetchData = async () => {
    try {
      const response = await fetch('/api/crm/supabase')
      const data = await response.json()
      
      if (response.ok && data.ok) {
        setContacts(data.contacts || [])
        setAppointments(data.appointments || [])
        setTasks(data.tasks || [])
      } else {
        console.error('CRM API error:', data.message)
        toast.error('Failed to load CRM data')
        setContacts([])
        setAppointments([])
        setTasks([])
      }
    } catch (error) {
      console.error('CRM fetch error:', error)
      toast.error('Unable to connect to server')
      setContacts([])
      setAppointments([])
      setTasks([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async () => {
    // Validation
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

      const result = await response.json()
      
      if (response.ok) {
        toast.success(`${activeTab === 'contacts' ? 'Contact' : activeTab === 'appointments' ? 'Appointment' : 'Task'} added successfully!`)
        setFormData({ name: '', email: '', phone: '', notes: '', date: '', time: '', title: '', description: '', priority: 'medium', dueDate: '' })
        setShowAddForm(false)
        setShowMobileMenu(false)
        fetchData()
      } else {
        toast.error(result.message || 'Failed to save data')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
    >
      <Toaster position="top-right" />
      
      {/* Mobile-Responsive Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px] border-b border-white/20 dark:border-gray-700/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center py-4 lg:py-8">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-2 mr-2 sm:mr-4"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <motion.div 
                className="flex items-center space-x-2 lg:space-x-4"
                variants={itemVariants}
              >
              <motion.div 
                className="p-2 lg:p-3 rounded-xl lg:rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <Users className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-blue-600 dark:to-blue-400 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Client Relationship Management</span>
                  <span className="sm:hidden">CRM</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-xs sm:text-sm lg:text-base hidden sm:block">Manage clients, appointments, and communications</p>
              </div>
              </motion.div>
            </div>
            
            {/* Desktop Actions */}
            <motion.div 
              className="hidden lg:flex space-x-3"
              variants={itemVariants}
            >
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === 'contacts' ? 'Add Contact' : activeTab === 'appointments' ? 'Add Appointment' : 'Add Task'}
                </Button>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div 
              className="lg:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-xl"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden pb-4 border-t border-gray-200 mt-4 pt-4"
              >
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => {
                      setShowAddForm(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {activeTab === 'contacts' ? 'Add Contact' : activeTab === 'appointments' ? 'Add Appointment' : 'Add Task'}
                  </Button>
                  
                  {/* Search Bar for Mobile */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 rounded-lg border-2 border-gray-200 dark:border-[#333] focus:border-blue-500 dark:bg-[#1E1E1E] dark:text-white dark:placeholder-[#aaa]"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Desktop Search Bar */}
        <motion.div 
          className="hidden lg:block mb-6"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-[20px]"
          >
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search contacts by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-lg border-2 border-gray-200 dark:border-[#333] focus:border-blue-500 text-base bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-[10px] text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder-[#aaa]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8"
          variants={itemVariants}
        >
          {[
            { 
              icon: Users, 
              label: 'Total Clients', 
              value: contacts.length, 
              color: 'blue',
              trend: '+12%'
            },
            { 
              icon: Calendar, 
              label: 'Appointments', 
              value: appointments.length, 
              color: 'green',
              trend: '+8%'
            },
            { 
              icon: MessageSquare, 
              label: 'Active Cases', 
              value: contacts.filter(c => c.notes?.includes('active')).length || '0', 
              color: 'purple',
              trend: '+15%'
            },
            { 
              icon: Target, 
              label: 'Success Rate', 
              value: contacts.length > 0 ? '100%' : '0%', 
              color: 'orange',
              trend: '+3%'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-[20px]"
              >
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</p>
                      <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    </div>
                    <motion.div 
                      className="p-2 lg:p-3 rounded-xl lg:rounded-2xl"
                      style={{
                        background: stat.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   stat.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   stat.color === 'purple' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' :
                                   'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: `0 8px 25px rgba(${
                          stat.color === 'blue' ? '59, 130, 246' : 
                          stat.color === 'green' ? '16, 185, 129' : 
                          stat.color === 'purple' ? '139, 92, 246' : 
                          '245, 158, 11'
                        }, 0.3)`
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <stat.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </motion.div>
                  </div>
                  <div className="flex items-center">
                    <Badge 
                      variant="secondary"
                      className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 text-xs hidden lg:flex"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile-Responsive Tab Navigation */}
        <motion.div 
          className="mb-6 lg:mb-8"
          variants={itemVariants}
        >
          <Card 
            className="border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]"
          >
            <CardContent className="p-3 lg:p-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-4">
                {[
                  { id: 'contacts', label: 'Contacts', icon: Users },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'tasks', label: 'Tasks', icon: Target }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center sm:justify-start space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-medium transition-all duration-300 w-full sm:w-auto ${
                      activeTab === tab.id
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      background: activeTab === tab.id 
                        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                        : 'transparent'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card 
                className="border-0 shadow-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2 rounded-xl"
                      style={{
                        background: activeTab === 'contacts' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                                   activeTab === 'appointments' ? 'linear-gradient(135deg, #10b981, #059669)' :
                                   'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {activeTab === 'contacts' ? <UserPlus className="h-6 w-6 text-white" /> :
                       activeTab === 'appointments' ? <Calendar className="h-6 w-6 text-white" /> :
                       <Target className="h-6 w-6 text-white" />}
                    </motion.div>
                    <span>{activeTab === 'contacts' ? 'Add New Contact' : activeTab === 'appointments' ? 'Add New Appointment' : 'Add New Task'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 lg:space-y-6">
                  {activeTab === 'contacts' && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <Label className="text-sm font-semibold">Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Doe"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Email</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john.doe@email.com"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Phone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+91 98765 43210"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Notes</Label>
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes about the contact"
                          rows={2}
                          className="mt-2 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'appointments' && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <Label className="text-sm font-semibold">Client Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Client name"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Meeting Title</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Consultation Meeting"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Date *</Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Time *</Label>
                          <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Meeting agenda or notes"
                          rows={2}
                          className="mt-2 border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all duration-300 resize-none"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'tasks' && (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <Label className="text-sm font-semibold">Task Title *</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Review contract documents"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Client Name</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Associated client (optional)"
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Due Date *</Label>
                          <Input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Priority</Label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                            className="mt-2 h-10 lg:h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 w-full px-3 bg-white"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Task details and requirements"
                          rows={2}
                          className="mt-2 border-2 border-gray-200 focus:border-purple-500 rounded-xl transition-all duration-300 resize-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={handleSubmit}
                        className={`w-full sm:w-auto px-6 lg:px-8 py-2 lg:py-3 rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                          activeTab === 'contacts' ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' :
                          activeTab === 'appointments' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                          'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                        }`}
                      >
                        {activeTab === 'contacts' ? <UserPlus className="h-4 w-4 mr-2" /> :
                         activeTab === 'appointments' ? <Calendar className="h-4 w-4 mr-2" /> :
                         <Target className="h-4 w-4 mr-2" />}
                        {activeTab === 'contacts' ? 'Add Contact' : activeTab === 'appointments' ? 'Add Appointment' : 'Add Task'}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddForm(false)
                          setFormData({ name: '', email: '', phone: '', notes: '', date: '', time: '', title: '', description: '', priority: 'medium', dueDate: '' })
                        }}
                        className="w-full sm:w-auto px-6 lg:px-8 py-2 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]"
                  >
                    <CardContent className="p-4 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                          <motion.div 
                            className="p-3 lg:p-4 rounded-xl lg:rounded-2xl flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <User className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3 truncate">{contact.name}</h3>
                            <div className="space-y-2">
                              {contact.email && (
                                <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
                                  <div className="p-1.5 lg:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                    <Mail className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                                  </div>
                                  <span className="text-sm lg:text-base truncate text-gray-600 dark:text-gray-300">{contact.email}</span>
                                </div>
                              )}
                              {contact.phone && (
                                <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
                                  <div className="p-1.5 lg:p-2 bg-green-50 rounded-lg flex-shrink-0">
                                    <Phone className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                                  </div>
                                  <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{contact.phone}</span>
                                </div>
                              )}
                              {contact.createdAt && (
                                <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600">
                                  <div className="p-1.5 lg:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                                    <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
                                  </div>
                                  <span className="text-sm lg:text-base text-gray-600 dark:text-gray-300">Added {new Date(contact.createdAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {contact.notes && (
                              <p className="text-gray-600 dark:text-gray-300 mt-3 lg:mt-4 leading-relaxed text-sm lg:text-base">{contact.notes}</p>
                            )}
                          </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} className="lg:ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full lg:w-auto px-4 lg:px-6 py-2 lg:py-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Schedule</span>
                            <span className="sm:hidden">Call</span>
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredContacts.length === 0 && contacts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card 
                    className="border-0 shadow-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <CardContent className="p-8 lg:p-16 text-center">
                      <motion.div 
                        className="max-w-sm mx-auto"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="p-6 lg:p-8 rounded-3xl w-fit mx-auto mb-6"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          <Search className="h-16 lg:h-20 w-16 lg:w-20 text-white" />
                        </motion.div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">No contacts found</h3>
                        <p className="text-gray-600 mb-6 lg:mb-8 text-base lg:text-lg">No contacts match your search criteria. Try a different search term.</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => setSearchTerm('')}
                            variant="outline"
                            className="px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg rounded-xl lg:rounded-2xl transition-all duration-300"
                          >
                            Clear Search
                          </Button>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {contacts.length === 0 && !showAddForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]"
                  >
                    <CardContent className="p-8 lg:p-16 text-center">
                      <motion.div 
                        className="max-w-sm mx-auto"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.div 
                          className="p-6 lg:p-8 rounded-3xl w-fit mx-auto mb-6"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
                          }}
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 4,
                            ease: "easeInOut"
                          }}
                        >
                          <Users className="h-16 lg:h-20 w-16 lg:w-20 text-white" />
                        </motion.div>
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No contacts yet</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 lg:mb-8 text-base lg:text-lg">Start building your client relationships by adding your first contact</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => setShowAddForm(true)}
                            className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                            Add Contact
                          </Button>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div
              key="appointments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]">
                    <CardContent className="p-4 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                          <motion.div 
                            className="p-3 lg:p-4 rounded-xl lg:rounded-2xl flex-shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3 truncate">{appointment.clientName}</h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600 dark:text-gray-300">
                                <div className="p-1.5 lg:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm lg:text-base">{appointment.date} at {appointment.time}</span>
                              </div>
                              <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600 dark:text-gray-300">
                                <div className="p-1.5 lg:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                                  <Target className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="text-sm lg:text-base">{appointment.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`w-fit ${
                          appointment.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                          appointment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {appointments.length === 0 && (
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]">
                  <CardContent className="p-8 lg:p-16 text-center">
                    <motion.div 
                      className="p-6 lg:p-8 rounded-3xl w-fit mx-auto mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Calendar className="h-16 lg:h-20 w-16 lg:w-20 text-white" />
                    </motion.div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No appointments yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base lg:text-lg mb-6">Schedule appointments with your clients</p>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]">
                    <CardContent className="p-4 lg:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-3 lg:space-x-4 flex-1">
                          <motion.div 
                            className="p-3 lg:p-4 rounded-xl lg:rounded-2xl flex-shrink-0"
                            style={{
                              background: task.priority === 'high' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                                         task.priority === 'medium' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                         'linear-gradient(135deg, #10b981, #059669)',
                              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                            }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Target className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 lg:mb-3 truncate">{task.title}</h3>
                            <div className="space-y-2">
                              {task.description && (
                                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600 dark:text-gray-300">
                                <div className="p-1.5 lg:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm lg:text-base">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              {task.clientName && (
                                <div className="flex items-center space-x-2 lg:space-x-3 text-gray-600 dark:text-gray-300">
                                  <div className="p-1.5 lg:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                                    <User className="h-3 w-3 lg:h-4 lg:w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span className="text-sm lg:text-base">{task.clientName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`w-fit ${
                            task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' :
                            'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </Badge>
                          <Badge className={`w-fit ${
                            task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
                            task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300' :
                            'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {tasks.length === 0 && (
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-[20px]">
                  <CardContent className="p-8 lg:p-16 text-center">
                    <motion.div 
                      className="p-6 lg:p-8 rounded-3xl w-fit mx-auto mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <Target className="h-16 lg:h-20 w-16 lg:w-20 text-white" />
                    </motion.div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No tasks yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base lg:text-lg mb-6">Create and manage tasks for your clients</p>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function CRMPage() {
  return (
    <FeatureModal feature="CRM">
      <CRMContent />
    </FeatureModal>
  )
}