import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import '../styles/global.css';
import theme from '../styles/theme';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
}
