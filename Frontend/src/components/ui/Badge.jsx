import { clsx } from 'clsx'

const Badge = ({ 
  children, 
  variant = 'primary', 
  className,
  ...props 
}) => {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }

  return (
    <span 
      className={clsx('badge', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
