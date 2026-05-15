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
      const lang = (() => { try { return localStorage.getItem('pt_lang') || 'ko'; } catch { return 'ko'; } })();
      const ko = lang === 'ko';
      return (
        <div style={{
          background: '#020510', color: '#DDE2FF', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', fontFamily: "'Rajdhani','Barlow Condensed',sans-serif",
          padding: 24, textAlign: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#FF5757' }}>
            {ko ? '오류가 발생했습니다' : 'An error occurred'}
          </div>
          <div style={{ fontSize: 13, color: '#8899BB', maxWidth: 400, lineHeight: 1.6 }}>
            {ko
              ? '저장된 데이터는 안전합니다. 아래 버튼을 눌러 다시 시작하세요.'
              : 'Your saved data is safe. Press the button below to restart.'}
          </div>
          <div style={{ fontSize: 10, color: '#4A5A7A', maxWidth: 400, wordBreak: 'break-all',
            background: '#0C1128', padding: '8px 12px', borderRadius: 6, border: '1px solid #1E2748' }}>
            {String(this.state.error)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(0,229,160,0.15)', border: '2px solid rgba(0,229,160,0.5)',
              color: '#00E5A0', borderRadius: 8, padding: '10px 32px',
              cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 700,
            }}
          >
            🔄 {ko ? '다시 시작' : 'Restart'}
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
