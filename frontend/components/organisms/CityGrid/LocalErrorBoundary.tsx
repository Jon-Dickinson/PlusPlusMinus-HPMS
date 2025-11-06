import React from 'react';
import { CityProvider } from '../CityContext';
import DndShell from '../../molecules/DndShell';

interface LocalErrorBoundaryProps {
  children: React.ReactNode;
}

interface LocalErrorBoundaryState {
  hasError: boolean;
}

class LocalErrorBoundary extends React.Component<
  LocalErrorBoundaryProps,
  LocalErrorBoundaryState
> {
  constructor(props: LocalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // swallow; we'll recover by rendering with providers
    // console.debug('CityGrid recovered from error', { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <CityProvider>
          <DndShell>{this.props.children}</DndShell>
        </CityProvider>
      );
    }
    return this.props.children;
  }
}

export default LocalErrorBoundary;