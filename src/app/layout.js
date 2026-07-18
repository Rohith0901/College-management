import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import AppContent from '@/components/AppContent';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'CollegeHub - College Management System',
  description: 'Complete college management with cafeteria booking, parking, exams, and AI assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-[76px]">
              <AppContent>{children}</AppContent>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
