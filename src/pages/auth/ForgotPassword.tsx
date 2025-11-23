import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AuthCard from '../../components/auth/AuthCard'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateEmail = () => {
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!validateEmail()) {
      return
    }

    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccessMessage(
          'Password reset email sent! Please check your inbox and follow the instructions to reset your password.'
        )
        setEmail('')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      footer={
        <p>
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <InputField
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          error={error && !successMessage ? error : undefined}
          placeholder="you@example.com"
          required
          autoComplete="email"
          helperText="We'll send a password reset link to this email"
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className="mt-6"
        >
          Send Reset Link
        </Button>
      </form>
    </AuthCard>
  )
}

export default ForgotPassword

