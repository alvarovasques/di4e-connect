
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/layout/app-providers';
import MainLayout from '@/components/layout/main-layout';
import { MOCK_CURRENT_USER } from '@/lib/mock-data'; 
// import { usePathname } from 'next/navigation'; // This will cause an error if used directly here. Need to wrap in client component or move logic.

export const metadata: Metadata = {
  title: 'Di4E Connect',
  description: 'Atendimento ao Cliente WhatsApp com IA',
};

// This is a server component. Conditional rendering of MainLayout needs to be handled carefully.
// One way is to have a client component that reads pathname and then decides.
// Or, use Next.js route groups for different layouts.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pathname = usePathname(); // This cannot be used directly in Server Component RootLayout
  // const isAuthPage = pathname?.startsWith('/auth'); // Example check for deciding layout

  // For the login page to appear truly standalone without MainLayout affecting its styling (like margins for sidebar),
  // the ideal Next.js approach is to use Route Groups. For example:
  // - src/app/(app)/layout.tsx (this would contain MainLayout for the main application)
  // - src/app/(app)/dashboard/page.tsx (and other app pages)
  // - src/app/(auth)/layout.tsx (this would be a simpler layout, perhaps just <>{children}</>)
  // - src/app/(auth)/login/page.tsx
  // This way, /auth/login uses (auth)/layout.tsx and /dashboard uses (app)/layout.tsx.

  // Since we are not implementing route groups in *this* step, the LoginPage component itself
  // uses `min-h-screen flex items-center justify-center` on its root `div`. This helps it
  // take over the viewport. However, if `MainLayout` applies global styles like `md:ml-64` to its
  // `children` container, the login page might still be offset. The current LoginPage style aims to
  // make it appear full-screen as much as possible *within* the constraints of the current layout structure.

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..0,900;1,200..1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AppProviders>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

    