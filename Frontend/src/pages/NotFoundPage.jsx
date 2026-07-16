import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'

export function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-4"></div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
          {t('pageNotFound')}
        </h2>
        
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {t('pageNotFoundMessage')}
        </p>
        
        <div className="space-y-3">
          <Link to="/">
            <Button variant="primary" size="lg">
              <HomeIcon className="h-5 w-5 mr-2" />
              {t('goHome')}
            </Button>
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              ← {t('goBack')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
