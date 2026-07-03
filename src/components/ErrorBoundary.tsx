import { Component, ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';
import Section from './ui/Section';
import Container from './ui/Container';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Section variant="glass" padding="lg" className="min-h-screen flex items-center justify-center pt-24">
          <Container size="sm" className="text-center">
            <h2 className="font-serif text-3xl font-bold text-text mb-4">
              Something went wrong.
            </h2>
            <p className="text-text-muted mb-8">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Reload Page
            </Button>
          </Container>
        </Section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
