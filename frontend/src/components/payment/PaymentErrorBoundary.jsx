import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Payment form error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <FiAlertCircle className="text-red-600 mb-3" size={32} />
          <h3 className="text-red-800 font-bold text-lg mb-2">Payment Form Error</h3>
          <p className="text-red-700 text-sm mb-4">
            An error occurred while loading the payment form. This might be due to:
          </p>
          <ul className="text-red-700 text-xs list-disc list-inside mb-4 space-y-1">
            <li>Stripe configuration issue</li>
            <li>Network connection problem</li>
            <li>Browser compatibility issue</li>
          </ul>
          <div className="space-y-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn-primary text-sm mr-2"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="btn-secondary text-sm"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="text-xs text-red-600 cursor-pointer">Error Details</summary>
              <pre className="text-xs text-red-700 mt-2 p-2 bg-red-100 rounded overflow-auto">
                {this.state.error.toString()}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;

