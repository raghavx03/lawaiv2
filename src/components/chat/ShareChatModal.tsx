'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Share2, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShareChatModalProps {
  open: boolean
  onClose: () => void
  shareUrl: string | null
  chatTitle: string
}

export function ShareChatModal({ open, onClose, shareUrl, chatTitle }: ShareChatModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (shareUrl) {
      // Always try native share first on mobile
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: `Legal Chat: ${chatTitle}`,
            text: 'Check out this legal consultation with RAGS AI Assistant',
            url: shareUrl
          })
          return
        } catch (error) {
          // User cancelled or error occurred, fallback to copy
        }
      }
      // Fallback to copy
      await handleCopy()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Chat</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Share this legal consultation with others. They'll be able to view the conversation but not continue it.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Chat: <span className="font-medium">{chatTitle}</span>
            </p>
          </div>
          
          {shareUrl && (
            <div className="flex items-center space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={!shareUrl}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}