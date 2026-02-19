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
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white border border-red-100 rounded-xl shadow-sm p-6 max-w-2xl w-full">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Application error</h2>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{String(this.state.error)}</pre>
            <div className="mt-4 text-sm text-gray-500">Please check the browser console for details.</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
