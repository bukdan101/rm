'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Phone,
  User,
  Clock,
  CheckCheck,
  Car,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  listing_id: string
  listing_title: string
  listing_image: string | null
  other_user_id: string
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  last_message_at: string
  unread_count: number
  status: string
}

interface Message {
  id: string
  sender_id: string
  message: string
  created_at: string
  is_read: boolean
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function ConversationItem({ conversation, isActive, onClick }: { 
  conversation: Conversation
  isActive: boolean
  onClick: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
        isActive ? 'bg-muted' : 'hover:bg-muted/50'
      }`}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_user_avatar || ''} />
          <AvatarFallback>
            {conversation.other_user_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {conversation.unread_count > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {conversation.unread_count}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium truncate">{conversation.other_user_name}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(conversation.last_message_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
        {conversation.listing_title && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Car className="h-3 w-3" />
            <span className="truncate">{conversation.listing_title}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/conversations')
        const data = await res.json()
        if (data.success) {
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/conversations/${conv.id}/messages`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv => 
    conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pesan</h1>
          <p className="text-muted-foreground">Chat dengan penjual dan pembeli</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Chat GRATIS di Public Marketplace
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari percakapan..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={selectedConversation?.id === conv.id}
                    onClick={() => handleSelectConversation(conv)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada percakapan</p>
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.other_user_avatar || ''} />
                    <AvatarFallback>
                      {selectedConversation.other_user_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConversation.other_user_name}</p>
                    {selectedConversation.listing_title && (
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.listing_title}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Lihat Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Hubungi via Telepon
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className="h-12 w-48 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              <span>{formatTime(msg.created_at)}</span>
                              {isOwn && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Belum ada pesan</p>
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ketik pesan..." 
                    className="flex-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Pilih percakapan untuk mulai chat</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
