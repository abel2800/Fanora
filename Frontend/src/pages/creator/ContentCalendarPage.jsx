import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { contentAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

function itemDate(item) {
  return new Date(item.scheduledPublishDate || item.publishedAt || item.createdAt)
}

export function ContentCalendarPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(() => new Date())

  const range = useMemo(() => {
    if (view === 'week') {
      const from = startOfWeek(cursor)
      const to = new Date(from)
      to.setDate(to.getDate() + 7)
      return { from, to }
    }
    return { from: startOfMonth(cursor), to: endOfMonth(cursor) }
  }, [cursor, view])

  const { data: items = [], isLoading } = useQuery(
    ['content-calendar', range.from.toISOString(), range.to.toISOString()],
    () => contentAPI.getCalendar({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    }),
    { select: (res) => res.data?.data || [] }
  )

  const rescheduleMutation = useMutation(
    ({ id, scheduledPublishDate }) => contentAPI.updateCalendarItem(id, { scheduledPublishDate }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['content-calendar'])
        toast.success(t('rescheduled'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failedToReschedule')),
    }
  )

  const days = useMemo(() => {
    if (view === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(range.from)
        d.setDate(d.getDate() + i)
        return d
      })
    }
    const first = startOfMonth(cursor)
    const startPad = first.getDay()
    const totalDays = endOfMonth(cursor).getDate()
    const cells = []
    for (let i = 0; i < startPad; i += 1) cells.push(null)
    for (let d = 1; d <= totalDays; d += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    }
    return cells
  }, [cursor, range.from, view])

  const byDay = useMemo(() => {
    const map = {}
    items.forEach((item) => {
      const key = itemDate(item).toDateString()
      if (!map[key]) map[key] = []
      map[key].push(item)
    })
    return map
  }, [items])

  const shift = (dir) => {
    const next = new Date(cursor)
    if (view === 'week') next.setDate(next.getDate() + dir * 7)
    else next.setMonth(next.getMonth() + dir)
    setCursor(next)
  }

  if (isLoading) return <PageSkeleton rows={6} />

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-100">{t('contentCalendar')}</h1>
            <p className="text-gray-400 mt-1">
              {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-pill border border-charcoal-600 overflow-hidden">
              <button
                type="button"
                onClick={() => setView('month')}
                className={`px-4 py-2 text-sm ${view === 'month' ? 'bg-primary-500 text-charcoal-900' : 'text-gray-300'}`}
              >
                {t('month')}
              </button>
              <button
                type="button"
                onClick={() => setView('week')}
                className={`px-4 py-2 text-sm ${view === 'week' ? 'bg-primary-500 text-charcoal-900' : 'text-gray-300'}`}
              >
                {t('week')}
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => shift(-1)}>←</Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>{t('today')}</Button>
            <Button variant="outline" size="sm" onClick={() => shift(1)}>→</Button>
          </div>
        </div>

        <div className={`grid gap-2 ${view === 'week' ? 'grid-cols-1 sm:grid-cols-7' : 'grid-cols-7'}`}>
          {view === 'month' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-xs text-gray-500 text-center py-2 hidden sm:block">{d}</div>
          ))}
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="min-h-[88px] hidden sm:block" />
            const dayItems = byDay[day.toDateString()] || []
            return (
              <Card key={day.toISOString()} className="min-h-[100px] p-2 space-y-1">
                <p className="text-xs text-gray-400 font-medium">{day.getDate()}</p>
                {dayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left rounded-lg bg-charcoal-700/80 hover:bg-charcoal-600 px-2 py-1.5 transition"
                    onClick={() => {
                      const next = prompt(t('reschedulePrompt'), item.scheduledPublishDate || '')
                      if (next) rescheduleMutation.mutate({ id: item.id, scheduledPublishDate: next })
                    }}
                  >
                    <p className="text-xs text-gray-100 truncate">{item.title}</p>
                    <Badge variant="secondary" size="sm" className="mt-1">{item.status}</Badge>
                  </button>
                ))}
              </Card>
            )
          })}
        </div>

        {items.length === 0 && (
          <p className="text-center text-gray-400 mt-8">{t('noScheduled')}</p>
        )}
      </div>
    </div>
  )
}
