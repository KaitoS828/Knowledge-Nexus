import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

console.log("[index.tsx] Script started");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("[index.tsx] FATAL: Root element not found");
  throw new Error("Could not find root element to mount to");
}

console.log("[index.tsx] Root element found, creating root...");
const root = ReactDOM.createRoot(rootElement);

console.log("[index.tsx] Rendering App...");
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
console.log("[index.tsx] Render called");