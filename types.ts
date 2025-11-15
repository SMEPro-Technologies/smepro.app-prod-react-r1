// This file re-exports all types from `src/types.ts` to provide a consistent
// import path for files at the root level, like `index.tsx`, and handles global augmentations.
import React from 'react';

// FIX: Restore global JSX augmentation. This is critical for TypeScript to recognize
// standard HTML elements like 'div', 'button', etc. Without this, the JSX.IntrinsicElements
// interface can be overwritten, leading to compilation errors across the app.
declare global {
    namespace JSX {
        interface IntrinsicElements extends React.JSX.IntrinsicElements {
            // This is where custom elements like the old 'stripe-buy-button' would go.
            // Even if empty, this structure ensures we are AUGMENTING React's types, not REPLACING them.
        }
    }
}

export * from './src/types';