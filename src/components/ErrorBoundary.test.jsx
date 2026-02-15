import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

// A component that throws during render
function ThrowingComponent({ shouldThrow = true }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Child rendered successfully</div>
}

describe('ErrorBoundary', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('shows error UI when a child component throws', () => {
    // Suppress console.error noise from React and our ErrorBoundary in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('does not render children after an error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Child rendered successfully')).not.toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('renders the exclamation mark icon in error state', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('!')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
