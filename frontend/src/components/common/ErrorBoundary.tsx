// ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(error: any, info: any) {
    // could send to monitoring here
    // eslint-disable-next-line no-console
    console.error('Unhandled error in React tree:', error, info);
  }

  render() {
    if (this.state.error) {
      const err: any = this.state.error;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6 max-w-2xl w-full">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Application error</h2>
            <div className="text-sm text-gray-700 mb-3">
              <strong>Error:</strong> {err?.message || String(err)}
            </div>
            {err?.stack && (
              <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-64 overflow-auto border rounded p-2 bg-gray-50">{err.stack}</pre>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Reload
              </button>
              <div className="text-sm text-gray-500">Open developer console for full trace.</div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
