import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { messagesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { formatRelativeTime } from '../lib/utils'
import toast from 'react-hot-toast'

export function MessagesPage() {
  const { user } = useAuth()
  const { userId } = useParams()
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState(userId || null)
  const [messageText, setMessageText] = useState('')

  const { data: conversations = [], isLoading } = useQuery(
    ['conversations'],
    () => messagesAPI.getConversations(),
    { select: (res) => res.data.data || [] }
  )

  useEffect(() => {
    if (userId) setSelectedUserId(userId)
    else if (!selectedUserId && conversations.length > 0) {
      setSelectedUserId(conversations[0].otherUser?.id)
    }
  }, [userId, conversations, selectedUserId])

  const selectedConversation = conversations.find(
    (conversation) => conversation.otherUser?.id === selectedUserId
  )

  const { data: messagesData, isLoading: messagesLoading } = useQuery(
    ['messages', selectedUserId],
    () => messagesAPI.getMessages(selectedUserId),
    {
      enabled: !!selectedUserId,
      select: (res) => res.data,
    }
  )

  const sendMutation = useMutation(
    (content) => messagesAPI.sendMessage(selectedUserId, { content }),
    {
      onSuccess: () => {
        setMessageText('')
        queryClient.invalidateQueries(['messages', selectedUserId])
        queryClient.invalidateQueries('conversations')
        toast.success('Message sent')
      },
      onError: () => toast.error('Failed to send message'),
    }
  )

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUserId) return
    sendMutation.mutate(messageText.trim())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-5rem)] md:h-screen">
        <div className="w-full md:w-80 border-r border-charcoal-700 overflow-y-auto">
          <div className="p-4 border-b border-charcoal-700">
            <h1 className="text-xl font-bold text-gray-100">Messages</h1>
          </div>
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm">No conversations yet</p>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.otherUser
              const active = selectedUserId === otherUser?.id
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedUserId(otherUser.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-charcoal-800 transition-colors ${
                    active ? 'bg-charcoal-800' : ''
                  }`}
                >
                  <Avatar src={otherUser?.profileImage} alt={otherUser?.username} size="md" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-100 truncate">
                      {otherUser?.firstName || otherUser?.username}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="hidden md:flex flex-1 flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-charcoal-700">
                <h2 className="font-semibold text-gray-100">
                  @{selectedConversation?.otherUser?.username}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <LoadingSpinner />
                ) : (
                  (messagesData?.data || []).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card className={`max-w-md p-3 ${
                        message.senderId === user?.id
                          ? 'bg-primary-500/20 border-primary-500/30'
                          : 'bg-charcoal-800'
                      }`}>
                        <p className="text-gray-100">{message.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(message.createdAt)}
                        </p>
                      </Card>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-charcoal-700 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-charcoal-800 border border-charcoal-700 rounded-lg px-4 py-2 text-gray-100"
                />
                <Button type="submit" variant="primary" disabled={sendMutation.isLoading}>
                  <PaperAirplaneIcon className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
