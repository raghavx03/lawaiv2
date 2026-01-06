'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Plus, Share2, Trash2, MoreHorizontal, Search, Edit3 } from 'lucide-react'

import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatSession {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  updatedAt: Date
}

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  onNewChat: () => void
  onSelectSession: (session: ChatSession) => void
  onShareSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
  onRenameSession?: (sessionId: string, newTitle: string) => void
}

export function ChatSidebar({
  sessions,
  currentSession,
  onNewChat,
  onSelectSession,
  onShareSession,
  onDeleteSession,
  onRenameSession
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleShare = async (sessionId: string) => {
    const shareUrl = await onShareSession(sessionId)
    if (shareUrl) {
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          await navigator.share({
            title: 'Legal Chat with RAGS',
            url: shareUrl
          })
        } catch {
          navigator.clipboard.writeText(shareUrl)
        }
      } else {
        navigator.clipboard.writeText(shareUrl)
      }
    }
  }

  const handleRename = (sessionId: string, currentTitle: string) => {
    setEditingSession(sessionId)
    setEditTitle(currentTitle)
  }

  const saveRename = () => {
    if (editingSession && editTitle.trim() && onRenameSession) {
      onRenameSession(editingSession, editTitle.trim())
    }
    setEditingSession(null)
    setEditTitle('')
  }

  const cancelRename = () => {
    setEditingSession(null)
    setEditTitle('')
  }

  // Remove collapsed view - always show full sidebar

  return (
    <div className="w-80 ai-chat-sidebar border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <div>
            <h2 className="font-semibold text-white">RAGS</h2>
            <p className="text-xs text-gray-400">Legal AI Assistant</p>
          </div>
        </div>
        
        <Button
          onClick={onNewChat}
          className="w-full bg-green-600 hover:bg-green-700 text-white mb-3"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ai-chat-input pl-10 text-sm"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in ${
                  currentSession?.id === session.id
                    ? 'bg-green-600/20 border border-green-600/30'
                    : 'hover:bg-gray-700/50'
                }`}
                onClick={() => onSelectSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename()
                          if (e.key === 'Escape') cancelRename()
                        }}
                        onBlur={saveRename}
                        className="ai-chat-input text-sm h-6 p-1"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-sm font-medium text-white truncate">
                        {session.title}
                      </h3>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">
                        {session.messages.length} messages
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {/* Last message preview */}
                    {session.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {session.messages[session.messages.length - 1].content.slice(0, 60)}...
                      </p>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleRename(session.id, session.title)}>
                        <Edit3 className="h-3 w-3 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(session.id)}>
                        <Share2 className="h-3 w-3 mr-2" />
                        Share
                      </DropdownMenuItem>
                      {onDeleteSession && (
                        <DropdownMenuItem 
                          onClick={() => onDeleteSession(session.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}