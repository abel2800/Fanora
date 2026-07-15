import { clsx } from 'clsx'

const Card = ({ children, className, hover = false, ...props }) => (
  <div
    className={clsx(
      'card-base',
      hover && 'content-card',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const CardHeader = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-b border-charcoal-700', className)}>
    {children}
  </div>
)

const CardContent = ({ children, className }) => (
  <div className={clsx('px-6 py-4', className)}>
    {children}
  </div>
)

const CardFooter = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-t border-charcoal-700 bg-charcoal-700', className)}>
    {children}
  </div>
)

const CardTitle = ({ children, className }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-100', className)}>
    {children}
  </h3>
)

const CardDescription = ({ children, className }) => (
  <p className={clsx('text-sm text-gray-400 mt-1', className)}>
    {children}
  </p>
)

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
}
