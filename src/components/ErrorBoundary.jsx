import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // In production, this would send to an error reporting service
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <span className="text-4xl">!</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="text-gray-600 dark:text-white/70">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl button-primary text-brand-graphite font-semibold"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
