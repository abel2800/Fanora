import { Outlet, Link } from 'react-router-dom'
import { useI18n } from '../../contexts/I18nContext'

export function AuthLayout() {
  const { t, language, toggleLanguage } = useI18n()

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
          <div className="h-10 w-10 bg-primary-500 rounded-card flex items-center justify-center">
            <span className="text-charcoal-900 font-bold text-xl">F</span>
          </div>
          <span className="text-2xl font-bold text-gray-100">Fanora</span>
        </Link>
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            aria-label={t('changeLanguage')}
          >
            {t('language')}: {language === 'am' ? t('amharic') : t('english')}
          </button>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-charcoal-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-charcoal-700">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
