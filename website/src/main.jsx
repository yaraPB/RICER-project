import { ThemeProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import theme from './theme.jsx'

createRoot(document.getElementById('root')).render(
  <>
   <ThemeProvider theme={theme}>
    <App />
   </ThemeProvider>
  </>,
)
