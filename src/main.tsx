import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { InfiniteCanvas } from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InfiniteCanvas />
  </StrictMode>
);
