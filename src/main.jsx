import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Game error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#020510',
          color: '#DDE2FF',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: "'Rajdhani','Barlow Condensed',sans-serif",
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎡</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#FF6B9D' }}>
            Oops! Something went wrong
          </div>
          <div style={{ fontSize: 13, color: '#8899BB', marginBottom: 16, maxWidth: 480, lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(100,120,255,0.15)',
              border: '1px solid rgba(100,120,255,0.4)',
              color: '#DDE2FF',
              borderRadius: 8,
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            🔄 Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
