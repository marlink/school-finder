'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BarChart3, 
  Flag,
  Database,
  Shield,
  Settings,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'School Management', href: '/admin/schools', icon: School },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
  { name: 'Data Scraping', href: '/admin/scraping', icon: Database },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      const supabase = createClient();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        // Temporary: Allow access for the specific admin email
        const adminEmails = ['design.marceli@gmail.com'];
        if (adminEmails.includes(user.email || '')) {
          setUserEmail(user.email || '');
          setIsLoading(false);
          return;
        }

        // Try to check profile table, but handle if it doesn't exist
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            // If profiles table doesn't exist (error code 42P01), allow admin emails
            if (profileError.code === '42P01' && adminEmails.includes(user.email || '')) {
              console.log('Profiles table not found, allowing admin email access');
              setUserEmail(user.email || '');
              setIsLoading(false);
              return;
            }
            throw profileError;
          }

          if (!profile || profile.role !== 'admin') {
            router.push('/');
            return;
          }

          setUserEmail(user.email || '');
          setIsLoading(false);
        } catch (profileError: any) {
           console.error('Error checking profile:', profileError);
           // If it's a table not found error and user is admin email, allow access
           if (profileError?.code === '42P01' && adminEmails.includes(user.email || '')) {
             console.log('Profiles table not found, allowing admin email access');
             setUserEmail(user.email || '');
             setIsLoading(false);
             return;
           }
           router.push('/');
         }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <Badge variant="destructive" className="mt-1">
                Administrator
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}