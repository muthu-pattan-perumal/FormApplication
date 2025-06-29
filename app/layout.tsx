// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import DesignerContextProvider from '@/components/context/DesignerContext';
import NextTopLoader from "nextjs-toploader";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My App',
  description: 'Form Builder App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader />
        <DesignerContextProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}</ThemeProvider>
          <Toaster />
        </DesignerContextProvider>
      </body>
    </html>
  );
}
