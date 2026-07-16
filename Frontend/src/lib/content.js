/** Normalize API feed/content shapes for UI components. */
export function normalizeFeedPost(item) {
  if (!item) return null

  const creator = item.creator || {}
  const accessType = item.accessType || 'free'

  let type = item.type
  if (accessType === 'pay_per_view') type = 'paid'
  else if (accessType === 'premium') type = 'subscription'

  const timestamp = item.publishedAt || item.createdAt
  const formattedTimestamp = timestamp
    ? new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''

  return {
    id: item.id,
    creatorId: creator.id || item.creatorId,
    creatorName: creator.displayName || creator.username || item.creatorName || 'Creator',
    creatorUsername: creator.username || item.creatorUsername || '',
    creatorAvatar: creator.profileImage || item.creatorAvatar,
    content: item.description || item.textContent || item.caption || item.content || item.title || '',
    image: item.thumbnailUrl || item.mediaUrl || item.image,
    type,
    price: item.price,
    likesCount: item.likesCount ?? item.likes ?? 0,
    commentsCount: item.commentsCount ?? item.comments ?? 0,
    timestamp: formattedTimestamp,
    isLocked: item.isLocked ?? accessType !== 'free',
  }
}

export function normalizeWalletResponse(raw) {
  const data = raw?.data ?? raw ?? {}

  return {
    balance: data.balance ?? 0,
    currency: data.currency ?? 'ETB',
    hasPinCode: data.hasPinCode ?? false,
    telebirrLinked: data.telebirrAccount?.isVerified ?? data.telebirrLinked ?? false,
    cbeLinked: data.cbeAccount?.isVerified ?? data.cbeLinked ?? false,
    telebirrAccount: data.telebirrAccount,
    cbeAccount: data.cbeAccount,
    transactions: data.recentTransactions || data.transactions || [],
    limits: data.limits,
    totalReceived: data.totalReceived,
    totalSpent: data.totalSpent,
  }
}

export function normalizeDashboardResponse(raw) {
  const dashboard = raw?.dashboard ?? raw ?? {}

  return {
    followers: dashboard.profile?.followers ?? 0,
    subscribers: dashboard.subscriptions?.totalSubscribers ?? 0,
    totalViews: dashboard.content?.totalViews ?? 0,
    earnings: dashboard.content?.totalRevenue ?? dashboard.subscriptions?.monthlyRevenue ?? 0,
    recentContent: dashboard.recentContent ?? [],
    recentActivity: dashboard.recentActivity ?? [],
  }
}
