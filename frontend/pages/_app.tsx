import type { AppProps } from 'next/app'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
const GlobalStyle = createGlobalStyle`
  *, 
  *::before, 
  *::after { box-sizing: border-box; }

  html, body, #__next {
   height: 100%;
   width: 100%;
   overflow-x: hidden;
   }

  body {
    margin: 0;
    font-family: Roboto;
    background-color: ${({ theme }) => (theme as any)?.colors?.background ?? '#fff'};
    color: ${({ theme }) => (theme as any)?.colors?.text ?? '#000000'};
  }
`
import theme from '../styles/theme'
import { AuthProvider } from '../context/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
}
