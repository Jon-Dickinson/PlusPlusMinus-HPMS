import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
  text-align: center;
  color: #fff;
`;

const ErrorCard = styled.div`
  background: rgba(20, 20, 20, 0.8);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.4);
  max-width: 720px;
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  color: #fff;
`;

const Message = styled.p`
  margin: 0 0 16px 0;
  color: rgba(255,255,255,0.85);
`;

const Controls = styled.div`
  display:flex;
  gap: 12px;
  justify-content:center;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #004aee;
  color: white;
  font-weight: 600;
`;

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, info: any) {
    // send to local console and, if configured, remote reporter
    try {
      const { default: reportError } = await import('../../../lib/errorReporter');
      reportError(error, info);
    } catch (e) {
      // fallback logging
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary failed to report error', e);
      // eslint-disable-next-line no-console
      console.error(error, info);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer role="alert">
          <ErrorCard>
            <Title>Something went wrong</Title>
            <Message>
              The app encountered an error. You can try reloading the page or contact support if the problem persists.
            </Message>
            <Controls>
              <Button onClick={this.handleReload}>Reload</Button>
            </Controls>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children ?? null;
  }
}
