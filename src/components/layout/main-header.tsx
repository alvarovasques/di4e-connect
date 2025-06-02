'use client';

import { Bell, Search, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MainSidebar from "./main-sidebar"; // For mobile drawer
import { APP_NAME } from '@/lib/constants';
import AppLogo from '@/components/icons/app-logo';
import Link from 'next/link';

const MainHeader = () => {
  // In a real app, this would come from an auth hook
  const user = { name: 'Demo User', avatarUrl: 'https://placehold.co/40x40' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              {/* This is a simplified version for mobile. You might want a different sidebar component here. */}
              {/* Re-using MainSidebar for mobile drawer */}
              <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
                  <AppLogo className="h-8 w-8" />
                  <span>{APP_NAME}</span>
                </Link>
              </div>
              <nav className="mt-4 px-3">
                {/* You would map NAV_ITEMS here similar to MainSidebar or pass a simplified version */}
                {/* For brevity, this is simplified */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {/* Breadcrumbs or current page title could go here */}
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full" />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" className="h-8 w-8 rounded-full" />
          ) : (
            <UserCircle className="h-6 w-6" />
          )}
          <span className="sr-only">User Profile</span>
        </Button>
      </div>
    </header>
  );
};

export default MainHeader;
