import { useState } from 'react'
import { useQuery } from 'react-query'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { GiftIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { tipsAPI } from '../services/api'
import { formatCurrency, formatRelativeTime } from '../lib/utils'

export function TipDashboardPage() {
  const [tipMode, setTipMode] = useState('sent')

  const { data: stats } = useQuery(
    ['tip-stats'],
    () => tipsAPI.getStats(),
    { select: (res) => res.data.data }
  )

  const { data: tips = [], isLoading } = useQuery(
    ['tips', tipMode],
    () => (tipMode === 'sent' ? tipsAPI.getTipsSent() : tipsAPI.getTipsReceived()),
    { select: (res) => res.data.data || [] }
  )

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <GiftIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-100">Tips</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpIcon className="w-5 h-5 text-red-400" />
              <span className="text-gray-400">Total Sent</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">
              {formatCurrency(stats?.totalSent || 0)}
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownIcon className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Total Received</span>
            </div>
            <p className="text-2xl font-bold text-gray-100">
              {formatCurrency(stats?.totalReceived || 0)}
            </p>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={tipMode === 'sent' ? 'primary' : 'outline'}
            onClick={() => setTipMode('sent')}
          >
            Sent
          </Button>
          <Button
            variant={tipMode === 'received' ? 'primary' : 'outline'}
            onClick={() => setTipMode('received')}
          >
            Received
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : tips.length === 0 ? (
          <Card className="p-8 text-center text-gray-400">
            No {tipMode} tips yet
          </Card>
        ) : (
          <div className="space-y-3">
            {tips.map((tip) => {
              const person = tipMode === 'sent' ? tip.creator : tip.sender
              return (
                <Card key={tip.id} className="p-4 flex items-center gap-4">
                  <Avatar
                    src={person?.profileImage}
                    alt={person?.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100">
                      @{person?.username || 'user'}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {tip.metadata?.message || tip.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(tip.createdAt)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary-500">
                    {formatCurrency(tip.amount)}
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
