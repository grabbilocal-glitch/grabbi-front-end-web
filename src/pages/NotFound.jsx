import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="py-20 flex flex-col items-center text-center space-y-4">
      <div className="h-28 w-28 rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/15 flex items-center justify-center shadow-glow">
        <span className="text-4xl font-extrabold text-brand-gold">404</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>
      <p className="text-gray-600 dark:text-white/60 max-w-md">The page you are looking for doesn't exist. Let's take you back home.</p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl button-primary text-brand-graphite font-semibold"
      >
        <HomeIcon className="h-5 w-5" />
        <span>Return home</span>
      </Link>
    </div>
  )
}
