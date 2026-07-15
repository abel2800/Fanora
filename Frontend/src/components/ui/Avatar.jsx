import { clsx } from 'clsx'

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className,
  ...props 
}) => {
  const sizes = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
    '2xl': 'avatar-2xl',
  }

  const getFallbackText = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div 
      className={clsx(sizes[size], className)}
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || 'Avatar'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
      ) : null}
      <div 
        className={clsx(
          'w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-medium',
          src ? 'hidden' : 'flex'
        )}
        style={{ display: src ? 'none' : 'flex' }}
      >
        {getFallbackText(fallback || alt)}
      </div>
    </div>
  )
}

export { Avatar }
