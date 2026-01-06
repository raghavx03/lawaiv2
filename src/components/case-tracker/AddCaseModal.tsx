'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toast'

interface AddCaseModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCaseModal({ open, onClose, onSuccess }: AddCaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    cnr: '',
    partyName: '',
    searchType: 'cnr'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cnr && !formData.partyName) {
      toast.error('Please provide either CNR number or Party name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/case-tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          cnr: formData.cnr || undefined,
          partyName: formData.partyName || undefined,
          searchType: formData.searchType
        })
      })

      const data = await response.json()
      
      if (response.ok && data.ok) {
        toast.success('Case added to tracking successfully')
        setFormData({ cnr: '', partyName: '', searchType: 'cnr' })
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Failed to create case')
      }
    } catch (error) {
      toast.error('Failed to create case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Case to Tracker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="searchType" className="text-sm font-medium">Search By</Label>
            <Select value={formData.searchType} onValueChange={(value) => setFormData({ ...formData, searchType: value })}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cnr">CNR Number</SelectItem>
                <SelectItem value="party">Party Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.searchType === 'cnr' ? (
            <div className="space-y-2">
              <Label htmlFor="cnr" className="text-sm font-medium">CNR Number</Label>
              <Input
                id="cnr"
                value={formData.cnr}
                onChange={(e) => setFormData({ ...formData, cnr: e.target.value })}
                placeholder="e.g., DLCT01-123456-2024"
                className="h-11 dark:bg-[#1E1E1E] dark:border-[#333] dark:text-white dark:placeholder-[#aaa]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="partyName" className="text-sm font-medium">Party Name</Label>
              <Input
                id="partyName"
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                placeholder="e.g., John Doe vs State of Delhi"
                className="h-11 dark:bg-[#1E1E1E] dark:border-[#333] dark:text-white dark:placeholder-[#aaa]"
              />
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Note:</span> Case details will be fetched automatically from court records and added to your tracking list.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              {loading ? 'Adding Case...' : 'Add to Tracker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}