import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import '../styles/global.css';
import theme from '../styles/theme';
import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/molecules/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </ThemeProvider>
    </AuthProvider>
  );
}
