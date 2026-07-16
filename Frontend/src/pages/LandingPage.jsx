import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'
import {
  CheckBadgeIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export function LandingPage() {
  const { language, toggleLanguage, t } = useI18n()

  const previewCards = [
    { name: 'Liya', category: t('categoryFashion'), gradient: 'from-amber-300/30 to-orange-900/60' },
    { name: 'Nahom', category: t('categoryFitness'), gradient: 'from-sky-400/20 to-slate-950/80' },
    { name: 'Mahi', category: t('categoryMusic'), gradient: 'from-fuchsia-400/20 to-purple-950/70' },
  ]

  return (
    <div className="min-h-screen overflow-hidden bg-charcoal-900 text-gray-100">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
          Fanora<span className="text-primary-500">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-pill border border-charcoal-700 bg-charcoal-800 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-primary-500"
            aria-label={t('changeLanguage')}
          >
            {language === 'en' ? t('amharic') : t('english')}
          </button>
          <Link to="/auth/login" className="hidden text-sm font-semibold text-gray-300 hover:text-primary-500 sm:block">
            {t('login')}
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[74vh] max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pt-16">
          <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-pill border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm text-primary-500">
              <SparklesIcon className="h-4 w-4" />
              {t('landingBadge')}
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              {t('landingTitle')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400 sm:text-xl">
              {t('landingSubtitle')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/auth/signup?role=fan">
                <Button variant="primary" size="lg" className="w-full px-7 sm:w-auto">
                  {t('browseAsFan')}
                </Button>
              </Link>
              <Link to="/auth/signup?role=creator">
                <Button variant="outline" size="lg" className="w-full px-7 sm:w-auto">
                  {t('becomeCreator')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden h-[520px] lg:block" aria-hidden="true">
            {previewCards.map((card, index) => (
              <article
                key={card.name}
                className={`absolute w-64 overflow-hidden rounded-card border border-white/10 bg-gradient-to-br ${card.gradient} shadow-2xl backdrop-blur-xl ${
                  index === 0 ? 'left-0 top-28 -rotate-6' : index === 1 ? 'right-4 top-0 rotate-6' : 'bottom-2 right-24 -rotate-2'
                }`}
              >
                <div className="h-64 bg-white/5 backdrop-blur-2xl" />
                <div className="border-t border-white/10 bg-charcoal-800/80 p-5">
                  <p className="font-display text-xl">{card.name}</p>
                  <p className="mt-1 text-sm text-gray-400">{card.category}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-charcoal-700 bg-charcoal-800/70">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-7 sm:grid-cols-3 sm:px-8">
            {[
              [DevicePhoneMobileIcon, t('localPayments')],
              [CheckBadgeIcon, t('verifiedCreators')],
              [LockClosedIcon, t('privacyFirst')],
            ].map(([Icon, label]) => (
              <div key={label} className="flex items-center justify-center gap-3 text-sm font-medium text-gray-300">
                <Icon className="h-5 w-5 text-primary-500" />
                {label}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-gray-500 sm:flex-row sm:px-8">
        <p>© {new Date().getFullYear()} Fanora</p>
        <div className="flex gap-5">
          <Link to="/terms" className="hover:text-primary-500">{t('terms')}</Link>
          <Link to="/privacy" className="hover:text-primary-500">{t('privacy')}</Link>
          <Link to="/auth/login" className="hover:text-primary-500">{t('login')}</Link>
        </div>
      </footer>
    </div>
  )
}
