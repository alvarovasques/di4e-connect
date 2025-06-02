'use client';

import React from 'react';
// import { ThemeProvider } from 'next-themes'; // If you want to add theme toggling later

type AppProvidersProps = {
  children: React.ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  // For now, just a passthrough. Add ThemeProvider or QueryClientProvider here if needed.
  // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  //   {children}
  // </ThemeProvider>
  return <>{children}</>;
}
