
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adding console log to show when the app loads
console.log('App initializing at:', new Date().toISOString());

// Add event listener for auth state changes
window.addEventListener('storage', (event) => {
  if (event.key === 'nuevaGen_user') {
    console.log('Auth state changed:', event.newValue ? 'User logged in' : 'User logged out');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
