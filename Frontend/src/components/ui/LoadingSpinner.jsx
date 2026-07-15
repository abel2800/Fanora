import { clsx } from 'clsx'

const LoadingSpinner = ({ size = 'md', className, text }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div 
        className={clsx(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
          sizes[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

const PageLoader = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="xl" text={text} />
  </div>
)

const ContentLoader = ({ text = 'Loading content...' }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text={text} />
  </div>
)

const ButtonSpinner = () => (
  <div className="spinner mr-2" />
)

export { LoadingSpinner, PageLoader, ContentLoader, ButtonSpinner }
