import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-4"></div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <div className="space-y-3">
          <Link to="/">
            <Button variant="primary" size="lg">
              <HomeIcon className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
