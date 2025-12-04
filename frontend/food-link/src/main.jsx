import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error);
  root.render(
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Failed to load application</h1>
      <p>Error: {error.message}</p>
      <p>Please check the console for more details.</p>
    </div>
  );
}
