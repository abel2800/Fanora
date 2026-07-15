import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4">
          <h1 className="text-4xl font-bold text-white">Fanora</h1>
        </div>
        <p className="text-gray-300 text-xl">Support Content Creators on Fanora</p>
      </div>

      {/* Main CTA */}
      <div className="max-w-sm w-full space-y-4">
        <Link to="/auth/login" className="block">
          <Button variant="primary" className="w-full">
            Login
          </Button>
        </Link>

        <Link to="/auth/signup" className="block">
          <Button variant="secondary" className="w-full">
            Sign Up
          </Button>
        </Link>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-8 text-center text-sm text-gray-400 space-y-2">
        <p>
          <a href="#" className="hover:text-primary-500">Terms of Service</a>
          {' '} • {' '}
          <a href="#" className="hover:text-primary-500">Privacy Policy</a>
        </p>
        <p>Powered by Fanora</p>
      </div>
    </div>
  )
}
