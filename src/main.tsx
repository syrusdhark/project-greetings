import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import PerformanceOptimizer from './components/PerformanceOptimizer'
import './utils/errorSuppression'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PerformanceOptimizer />
    <App />
  </ErrorBoundary>
);
