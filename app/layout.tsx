// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { getCurrentUser } from "@/lib/auth";

import DesignerContextProvider from '@/components/context/DesignerContext';
import UserProvider from "@/components/providers/UserProvider";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'Form Builder App',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader />
        <UserProvider user={user}>
          <DesignerContextProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </DesignerContextProvider>
        </UserProvider>
      </body>
    </html>
  );
}
