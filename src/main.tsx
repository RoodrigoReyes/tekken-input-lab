import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/chakra-petch/latin-400.css';
import '@fontsource/chakra-petch/latin-600.css';
import '@fontsource/chakra-petch/latin-700.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

// Ask the browser not to evict the IndexedDB combo library under storage pressure.
navigator.storage?.persist?.().catch((error: unknown) => console.warn('Persistent storage request failed', error));

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
