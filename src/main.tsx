
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adding console log to show when the app loads
console.log('App initializing at:', new Date().toISOString());

// Add event listener for auth state changes
window.addEventListener('storage', (event) => {
  if (event.key === 'nuevaGen_user') {
    console.log('Auth state changed:', event.newValue ? 'User logged in' : 'User logged out');
    
    // Log user data when there's a change
    if (event.newValue !== null) {
      try {
        const userData = JSON.parse(event.newValue);
        console.log('User data changed:', userData.name, userData.isAdmin ? '(admin)' : '(regular user)');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);
