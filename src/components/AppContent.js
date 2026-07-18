'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import ChatBot from './ChatBot';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/cafeteria': 'Cafeteria',
  '/parking': 'Parking',
  '/exams': 'Exams',
  '/timetable': 'Timetable',
  '/turf': 'Turf Booking',
  '/complaints': 'Complaints',
  '/hospital': 'Hospital',
  '/admin': 'Admin Panel',
  '/login': 'Login',
  '/register': 'Register',
};

export default function AppContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={pageTitles[pathname] || 'CollegeHub'} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
      <ChatBot />
    </div>
  );
}
