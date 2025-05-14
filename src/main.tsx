
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adding console log to show when the app loads
console.log('App initializing at:', new Date().toISOString());

createRoot(document.getElementById("root")!).render(<App />);
