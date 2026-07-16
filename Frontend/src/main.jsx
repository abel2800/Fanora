import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { I18nProvider } from './contexts/I18nContext.jsx'
import './index.css'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <I18nProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1C202B',
                  color: '#F5F6F8',
                  border: '1px solid #353945',
                  borderRadius: '16px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: {
                    primary: '#4ADE80',
                    secondary: '#0B0D12',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#E85C5C',
                    secondary: '#0B0D12',
                  },
                },
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
