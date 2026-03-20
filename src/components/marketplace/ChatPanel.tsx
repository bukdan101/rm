'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message, Conversation } from '@/types/marketplace'
import { MessageCircle, Send, User, Bot, Loader2 } from 'lucide-react'

interface ChatPanelProps {
  conversationId?: string
  sellerName?: string
}

export function ChatPanel({ conversationId, sellerName = 'Seller' }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      conversation_id: 'demo',
      sender_id: 'seller',
      message: 'Halo, ada yang bisa saya bantu?',
      message_type: 'text',
      is_read: true,
      read_at: new Date().toISOString(),
      deleted_for_sender: false,
      deleted_for_receiver: false,
      created_at: new Date().toISOString(),
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      conversation_id: 'demo',
      sender_id: 'user',
      message: newMessage,
      message_type: 'text',
      is_read: false,
      read_at: null,
      deleted_for_sender: false,
      deleted_for_receiver: false,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setNewMessage('')
    setLoading(true)

    // Simulate response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: 'demo',
        sender_id: 'seller',
        message: 'Terima kasih atas pertanyaannya. Saya akan segera merespons.',
        message_type: 'text',
        is_read: true,
        read_at: new Date().toISOString(),
        deleted_for_sender: false,
        deleted_for_receiver: false,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, botMessage])
      setLoading(false)
    }, 1500)
  }

  return (
    <Card className="border-0 shadow-lg h-[500px] flex flex-col">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          Chat dengan {sellerName}
        </CardTitle>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender_id === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
