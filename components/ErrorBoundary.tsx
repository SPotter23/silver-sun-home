'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component to catch React errors
 * Must be a class component as React error boundaries require it
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // In production, you might want to log to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="p-6 rounded-xl bg-red-900/20 border border-red-800 text-red-300">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Error details
              </summary>
              <pre className="text-xs bg-red-950/50 p-3 rounded overflow-auto max-h-40">
                {this.state.error.toString()}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-sm"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Lightweight error boundary for specific sections
 */
export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-xl bg-red-900/10 border border-red-800/50 text-red-300 text-sm">
          <p className="font-medium">Error loading this section</p>
          <p className="text-xs mt-1">Please refresh the page to try again.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
