import { forwardRef } from 'react'
import { clsx } from 'clsx'

const Input = forwardRef(({ 
  type = 'text',
  error,
  className,
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(
        error ? 'input-error' : 'input-base',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

const FormGroup = ({ children, className }) => (
  <div className={clsx('form-group', className)}>
    {children}
  </div>
)

const Label = ({ children, htmlFor, required, className }) => (
  <label 
    htmlFor={htmlFor}
    className={clsx('form-label', className)}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
)

const ErrorMessage = ({ children, className }) => (
  <p className={clsx('form-error', className)}>
    {children}
  </p>
)

const HelpText = ({ children, className }) => (
  <p className={clsx('form-help', className)}>
    {children}
  </p>
)

export { Input, FormGroup, Label, ErrorMessage, HelpText }
