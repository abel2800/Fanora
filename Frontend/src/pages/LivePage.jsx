import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { SparklesIcon, PlayIcon, UserGroupIcon, GiftIcon } from '@heroicons/react/24/outline'

export function LivePage() {
  const [isLive, setIsLive] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [streamKey] = useState('stream_key_123ABC')
  const [viewers, setViewers] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'user1', message: 'Amazing stream! 🔥', timestamp: '2m' },
    { id: 2, user: 'user2', message: 'Thanks for the content!', timestamp: '1m' }
  ])
  const [chatInput, setChatInput] = useState('')

  const handleStartLive = () => {
    setIsLive(true)
    setShowStartModal(false)
    setViewers(Math.floor(Math.random() * 500) + 50)
  }

  const handleSendChat = (e) => {
    e.preventDefault()
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { id: chatMessages.length + 1, user: 'me', message: chatInput, timestamp: 'now' }])
      setChatInput('')
    }
  }

  if (!isLive) {
    return (
      <div className="min-h-screen bg-charcoal-900 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <PlayIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-100 mb-4">Go Live</h1>
            <p className="text-gray-400 mb-8">Stream to your fans and earn tips in real-time</p>
            <Button onClick={() => setShowStartModal(true)} variant="primary" size="lg">
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Live Stream
            </Button>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">How to stream</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">1</div>
                <h3 className="font-semibold text-gray-100 mb-2">Get OBS</h3>
                <p className="text-sm text-gray-400">Download and install Open Broadcaster Software (free)</p>
              </div>
              <div>
                <div className="bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">2</div>
                <h3 className="font-semibold text-gray-100 mb-2">Add Stream Key</h3>
                <p className="text-sm text-gray-400">Use your unique stream key in OBS settings</p>
              </div>
              <div>
                <div className="bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center mb-4 font-bold">3</div>
                <h3 className="font-semibold text-gray-100 mb-2">Go Live</h3>
                <p className="text-sm text-gray-400">Click Start Streaming and begin your broadcast</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Video */}
          <div className="lg:col-span-2">
            <Card className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-charcoal-900 rounded-full flex items-center justify-center">
                    <span className="text-red-500 font-bold">LIVE</span>
                  </div>
                </div>
                <p className="text-gray-300">Stream video will appear here</p>
              </div>
            </Card>

            {/* Description */}
            <Card className="mt-4 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100">Live Now!</h2>
                    <p className="text-gray-400">Just chatting with amazing people...</p>
                  </div>
                </div>
                <Badge variant="danger" className="animate-pulse">LIVE</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{viewers} viewers</span>
                </div>
                <div className="flex items-center gap-1">
                  <GiftIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">5000 ETB earned</span>
                </div>
              </div>

              <Button onClick={() => setIsLive(false)} variant="danger" className="w-full mt-4">
                End Stream
              </Button>
            </Card>
          </div>

          {/* Live Chat */}
          <Card className="flex flex-col">
            <div className="p-4 border-b border-charcoal-700">
              <h3 className="font-bold text-gray-100">Live Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id}>
                  <p className="text-xs text-gray-400">{msg.timestamp}</p>
                  <p className="text-sm"><span className="font-semibold text-primary-500">{msg.user}:</span> <span className="text-gray-300">{msg.message}</span></p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-4 border-t border-charcoal-700 flex gap-2">
              <Input
                placeholder="Send message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="sm">Send</Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Start Modal */}
      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title="Start Live Stream">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Stream Key (for OBS)</label>
            <div className="flex gap-2">
              <Input value={streamKey} readOnly />
              <Button onClick={() => { navigator.clipboard.writeText(streamKey); }} variant="outline" size="sm">Copy</Button>
            </div>
          </div>
          <Button onClick={handleStartLive} variant="primary" className="w-full">
            <PlayIcon className="w-5 h-5 mr-2" />
            Start Broadcasting
          </Button>
        </div>
      </Modal>
    </div>
  )
}
