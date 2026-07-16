import { Link } from 'react-router-dom'
import { 
  PlayIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const features = [
    {
      icon: PlayIcon,
      title: 'Exclusive Content',
      description: 'Access premium content from your favorite creators on Fanora'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fanora Payment Methods',
      description: 'Pay easily with Telebirr and CBE mobile banking'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Safe',
      description: 'Your data and payments are protected with bank-level security'
    }
  ]

  const stats = [
    { label: 'Creators', value: '1,000+' },
    { label: 'Subscribers', value: '50,000+' },
    { label: 'Content Hours', value: '10,000+' },
    { label: 'Countries', value: '1' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-primary-600 font-semibold">Welcome to Fanora</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-100 mb-6">
              Support
              <span className="block text-primary-600">Content Creators</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Join Fanora, the premier creator platform. Subscribe to exclusive content, 
              support talent, and connect with creators using familiar payment methods.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button variant="primary" size="xl" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Explore Creators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              Why Choose Fanora?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built for creators and supporters on Fanora, 
              with local payment methods and a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-charcoal-800 rounded-xl shadow-sm">
                <div className="mx-auto h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fans supporting their favorite creators on Fanora. 
            Create your account in minutes and start exploring.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                Join as Fan
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button variant="outline" size="xl" className="w-full sm:w-auto border-white text-white hover:bg-charcoal-800 hover:text-primary-600">
                Become Creator
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
