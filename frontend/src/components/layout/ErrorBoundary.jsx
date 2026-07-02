import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center p-6 text-white text-center">
          {/* Decorative Background Mesh */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative z-10 glass-strong border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6" style={{ backgroundColor: 'rgba(15, 15, 26, 0.7)', backdropFilter: 'blur(20px)' }}>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-3xl font-bold">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                Something went wrong
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                An unexpected error occurred. Please try reloading the application.
              </p>
              {this.state.error && (
                <div className="text-xs font-mono bg-black/30 border border-white/5 rounded-lg p-3 text-left overflow-auto max-h-32 text-rose-300">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('auth-storage'); // Reset state if state was corrupt
                window.location.reload();
              }}
              className="w-full py-3 px-6 bg-accent/20 hover:bg-accent/30 border border-accent/20 hover:border-accent/40 rounded-xl text-accent font-semibold transition-all shadow-lg hover:shadow-accent/5 cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
