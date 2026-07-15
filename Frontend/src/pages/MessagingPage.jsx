import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { PaperAirplaneIcon, PhoneIcon, VideoCameraIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export function MessagingPage() {
  const [conversations, setConversations] = useState([
    { id: 1, username: 'user1', profileImage: 'https://via.placeholder.com/100', lastMessage: 'Hey, this is awesome!', timestamp: '2m', unread: 2 },
    { id: 2, username: 'user2', profileImage: 'https://via.placeholder.com/100', lastMessage: 'Thanks for the content', timestamp: '1h', unread: 0 }
  ])

  const [selectedConv, setSelectedConv] = useState(conversations[0])
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user1', text: 'Hey, this is awesome!', timestamp: '2m', isMine: false },
    { id: 2, sender: 'me', text: 'Thank you!', timestamp: '1m', isMine: true }
  ])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setMessages([...messages, { id: messages.length + 1, sender: 'me', text: messageText, timestamp: 'now', isMine: true }])
    setMessageText('')
    toast.success('Message sent')
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto h-screen flex">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-charcoal-800 border-r border-charcoal-700 flex flex-col">
          <div className="p-4 border-b border-charcoal-700">
            <h1 className="text-xl font-bold text-gray-100 mb-4">Messages</h1>
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 border-b border-charcoal-700 cursor-pointer hover:bg-charcoal-700 transition ${
                  selectedConv?.id === conv.id ? 'bg-charcoal-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={conv.profileImage} size="sm" />
                    {conv.unread > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100 truncate">{conv.username}</p>
                    <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-500">{conv.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-col flex-1">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-charcoal-800 border-b border-charcoal-700 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedConv.profileImage} size="sm" />
                  <p className="font-semibold text-gray-100">{selectedConv.username}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><PhoneIcon className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm"><VideoCameraIcon className="w-4 h-4" /></Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.isMine ? 'bg-primary-500 text-white' : 'bg-charcoal-700 text-gray-100'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMine ? 'text-primary-100' : 'text-gray-400'}`}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="h-20 bg-charcoal-800 border-t border-charcoal-700 p-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="primary">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
