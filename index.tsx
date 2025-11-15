import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Import the `types.ts` module for its side effects to ensure that the
// global JSX namespace augmentation is applied correctly.
import './types';

// FIX: Global JSX augmentation for stripe-buy-button is now handled in 'src/types.ts'
// to ensure it is loaded correctly by the TypeScript compiler.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);