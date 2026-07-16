import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { MessagesSkeleton, Skeleton } from '../components/ui/Skeleton'
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { messagesAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { formatRelativeTime } from '../lib/utils'
import toast from 'react-hot-toast'

export function MessagesPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const { userId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState(userId || null)
  const [messageText, setMessageText] = useState('')
  const [messagePrice, setMessagePrice] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(userId))

  const { data: conversations = [], isLoading } = useQuery(
    ['conversations'],
    () => messagesAPI.getConversations(),
    { select: (res) => res.data.data || [] }
  )

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId)
      setMobileShowChat(true)
    }
  }, [userId])

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
    ({ content, price }) => messagesAPI.sendMessage(selectedUserId, { content, price }),
    {
      onSuccess: () => {
        setMessageText('')
        setMessagePrice('')
        queryClient.invalidateQueries(['messages', selectedUserId])
        queryClient.invalidateQueries('conversations')
        toast.success(t('messageSentToast'))
      },
      onError: () => toast.error(t('failedToSendMessage')),
    }
  )

  const unlockMutation = useMutation(
    (messageId) => messagesAPI.unlockMessage(messageId, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', selectedUserId])
        toast.success(t('messageUnlocked'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('unlockFailed')),
    }
  )

  const selectConversation = (id) => {
    setSelectedUserId(id)
    setMobileShowChat(true)
    navigate(`/messages/${id}`, { replace: true })
  }

  const backToList = () => {
    setMobileShowChat(false)
    navigate('/messages', { replace: true })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedUserId) return
    sendMutation.mutate({
      content: messageText.trim(),
      price: user?.isCreator && Number(messagePrice) > 0 ? Number(messagePrice) : 0,
    })
  }

  const messages = messagesData?.data || []

  const renderBubble = (message) => {
    const mine = message.senderId === user?.id
    const locked = message.isPaid && !message.isUnlocked && !mine

    return (
      <div
        key={message.id}
        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
      >
        <Card
          className={`max-w-[85%] sm:max-w-md p-3 ${
            mine
              ? 'bg-primary-500/20 border-primary-500/30'
              : locked
                ? 'bg-charcoal-800 border-primary-500/40'
                : 'bg-charcoal-800'
          }`}
        >
          {locked ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary-400">
                <LockClosedIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{t('paidMessage')}</span>
              </div>
              <p className="text-gray-400 text-sm blur-sm select-none">
                {message.content?.slice(0, 40) || '••••••••'}
              </p>
              <Button
                size="sm"
                variant="primary"
                disabled={unlockMutation.isLoading}
                onClick={() => unlockMutation.mutate(message.id)}
              >
                {t('unlockMessage')} · {message.price} {t('etb')}
              </Button>
            </div>
          ) : (
            <>
              {message.isPaid && (
                <p className="text-xs text-primary-400 mb-1">
                  {mine ? `Paid · ${message.price} ${t('etb')}` : t('unlock')}
                </p>
              )}
              <p className="text-gray-100 whitespace-pre-wrap break-words">{message.content}</p>
              {message.mediaUrl && (
                <img src={message.mediaUrl} alt="" className="mt-2 rounded-lg max-h-48 object-cover" />
              )}
            </>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatRelativeTime(message.createdAt)}
          </p>
        </Card>
      </div>
    )
  }

  if (isLoading) return <MessagesSkeleton />

  const chatPanel = (
    <>
      <div className="p-4 border-b border-charcoal-700 flex items-center gap-3">
        <button
          type="button"
          className="md:hidden p-1 text-gray-300 hover:text-primary-400"
          onClick={backToList}
          aria-label="Back"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <Avatar
          src={selectedConversation?.otherUser?.profileImage}
          alt={selectedConversation?.otherUser?.username}
          size="sm"
        />
        <h2 className="font-semibold text-gray-100 truncate">
          @{selectedConversation?.otherUser?.username || '...'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-2/3" />
            <Skeleton className="h-14 w-1/2 ml-auto" />
            <Skeleton className="h-14 w-3/5" />
          </div>
        ) : (
          messages.map(renderBubble)
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-charcoal-700 flex gap-2">
        {user?.isCreator && (
          <input
            type="number"
            min="0"
            step="1"
            value={messagePrice}
            onChange={(event) => setMessagePrice(event.target.value)}
            placeholder={`${t('price')} ${t('etb')}`}
            aria-label={t('paidMessage')}
            className="w-24 bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-gray-100 placeholder:text-gray-500"
          />
        )}
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 bg-charcoal-800 border border-charcoal-600 rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-500"
        />
        <Button type="submit" variant="primary" disabled={sendMutation.isLoading}>
          <PaperAirplaneIcon className="w-5 h-5" />
        </Button>
      </form>
    </>
  )

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="max-w-6xl mx-auto flex h-[calc(100vh-5rem)] md:h-screen">
        {/* Conversation list — hidden on mobile when chat is open */}
        <div
          className={`${
            mobileShowChat && selectedUserId ? 'hidden' : 'flex'
          } md:flex w-full md:w-80 border-r border-charcoal-700 overflow-y-auto flex-col`}
        >
          <div className="p-4 border-b border-charcoal-700">
            <h1 className="text-xl font-bold text-gray-100">{t('messages')}</h1>
          </div>
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-400 text-sm">{t('noConversations')}</p>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.otherUser
              const active = selectedUserId === otherUser?.id
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(otherUser.id)}
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
                      {conversation.lastMessage?.content || '—'}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary-500 text-charcoal-900 text-xs font-semibold rounded-full px-2 py-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Chat — shown on mobile when conversation selected */}
        <div
          className={`${
            mobileShowChat && selectedUserId ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col`}
        >
          {selectedUserId ? (
            chatPanel
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 px-4 text-center">
              {t('selectConversation')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
