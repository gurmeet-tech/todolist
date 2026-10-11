import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <main className="shell">
            <h1 className="title">Something broke</h1>
            <p className="empty">{this.state.error.message || 'Unexpected error'}</p>
            <button type="button" className="add" onClick={() => window.location.reload()}>
              Reload
            </button>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}
