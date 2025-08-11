"use client";

import dynamic from 'next/dynamic';

// Option 1: Direct import (for static components)
import FuelRequestPage from './pages/FuelRequestPage';

// Option 2: Dynamic import (for code splitting or SSR disable)
// const FuelRequestPage = dynamic(() => import('./FuelRequestPage'), {
//   ssr: false,
//   loading: () => <p>Loading...</p>
// });

export default function Page() {
  return (
    <main className="p-4">
      <FuelRequestPage />
    </main>
  );
}