import { Component, type ReactNode } from 'react'
import i18next from 'i18next'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      // Class component: read the shared i18next instance directly.
      const t = i18next.t.bind(i18next)
      return (
        <div className="bs-fallback" role="alert">
          <p className="bs-kicker">{t('error.kicker')}</p>
          <h1 className="bs-display">{t('error.title')}</h1>
          <p className="bs-fallback__detail">
            {this.state.error?.message || t('error.unknown')}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="bs-btn bs-btn--primary dn-interactive dn-focus"
          >
            {t('error.reload')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
