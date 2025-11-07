import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-amber-200/80">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`input-primary ${error ? 'border-red-500/50 focus:border-red-500' : ''} ${className || ''}`}
            {...props}
          />
          {error && (
            <div className="absolute right-3 top-3 text-red-500">
              <AlertCircle size={20} />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input