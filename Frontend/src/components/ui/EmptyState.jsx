import { clsx } from 'clsx'
import { Button } from './Button'

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  actionText,
  className 
}) => (
  <div className={clsx('empty-state', className)}>
    {Icon && (
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <Icon className="h-full w-full" />
      </div>
    )}
    
    {title && (
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
    )}
    
    {description && (
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
    )}
    
    {action && actionText && (
      <Button onClick={action} variant="primary">
        {actionText}
      </Button>
    )}
  </div>
)

export { EmptyState }
