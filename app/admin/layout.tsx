"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Image as ImageIcon,
  Settings,
  Layout,
  Building2,
  Menu,
  X,
  Camera,
  ClipboardList,
  Users,
  Briefcase
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [navigation, setNavigation] = useState([
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Homepage", href: "/admin/homepage", icon: Layout },
    { name: "Studio Dock One", href: "/admin/e16", icon: Building2 },
    { name: "Studio Dock Two", href: "/admin/e20", icon: Building2 },
    { name: "Studio Wharf", href: "/admin/lux", icon: Building2 },
    { name: "Photography", href: "/admin/photography", icon: Camera },
    { name: "Services", href: "/admin/services", icon: Briefcase },
    { name: "Membership", href: "/admin/membership", icon: Users },
    { name: "About Page", href: "/admin/about", icon: FileText },
    { name: "Images", href: "/admin/images", icon: ImageIcon },
    { name: "Booking Form", href: "/admin/booking", icon: ClipboardList },
    { name: "Photography Booking", href: "/admin/photography-booking", icon: ClipboardList },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]);

  // Set date on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  useEffect(() => {
    async function loadStudioTitles() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['e16_title', 'e20_title', 'lux_title']);

        if (error) {
          console.error('Error loading studio titles:', error);
          return;
        }

        if (data && data.length > 0) {
          const titles: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'e16_title') titles.e16 = item.value;
            if (item.key === 'e20_title') titles.e20 = item.value;
            if (item.key === 'lux_title') titles.lux = item.value;
          });

          setNavigation([
            { name: "Dashboard", href: "/admin", icon: Home },
            { name: "Homepage", href: "/admin/homepage", icon: Layout },
            { name: titles.e16 || "Studio Dock One", href: "/admin/e16", icon: Building2 },
            { name: titles.e20 || "Studio Dock Two", href: "/admin/e20", icon: Building2 },
            { name: titles.lux || "Studio Wharf", href: "/admin/lux", icon: Building2 },
            { name: "Photography", href: "/admin/photography", icon: Camera },
            { name: "Services", href: "/admin/services", icon: Briefcase },
            { name: "Membership", href: "/admin/membership", icon: Users },
            { name: "About Page", href: "/admin/about", icon: FileText },
            { name: "Images", href: "/admin/images", icon: ImageIcon },
            { name: "Booking Form", href: "/admin/booking", icon: ClipboardList },
            { name: "Photography Booking", href: "/admin/photography-booking", icon: ClipboardList },
            { name: "Settings", href: "/admin/settings", icon: Settings },
          ]);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioTitles();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf8]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-black/10
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-black/10">
            <Link href="/admin" className="block">
              <h1 className="text-xl font-light tracking-widest text-black">EASTDOCK</h1>
              <p className="text-xs tracking-[0.3em] text-black/60 mt-1">ADMIN PANEL</p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide
                    transition-all duration-200
                    ${isActive
                      ? 'bg-black text-white'
                      : 'text-black hover:bg-black/5'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-black/10">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300"
            >
              VIEW SITE
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-black/10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-black hover:bg-black/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              {currentDate && (
                <p className="text-sm text-black/60">
                  {currentDate}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile close button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg lg:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
