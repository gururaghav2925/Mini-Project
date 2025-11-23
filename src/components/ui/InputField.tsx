import { InputHTMLAttributes, forwardRef } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, error, helperText, className = '', type = 'text', ...props },
    ref
  ) => {
    const inputId = props.id || props.name || `input-${Math.random()}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full px-4 py-2.5 border rounded-lg 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'

export default InputField

