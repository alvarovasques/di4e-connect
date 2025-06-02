
'use client';

import { Bell, Search, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MainSidebar from "./main-sidebar"; 
import { APP_NAME } from '@/lib/constants';
import AppLogo from '@/components/icons/app-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';


const MainHeader = () => {
  const user = { name: 'Usuário Demo', avatarUrl: 'https://placehold.co/40x40' };
  const pathname = usePathname();
  
  const getCurrentPageLabel = () => {
    const findItem = (items: typeof NAV_ITEMS): string | null => {
      for (const item of items) {
        if (item.path === pathname) return item.label;
        if (item.subItems) {
          const subItemLabel = findItem(item.subItems);
          if (subItemLabel) return subItemLabel;
        }
      }
      return null;
    }
    // A simple fallback for top level /admin routes not directly in NAV_ITEMS subItems
    if (pathname.startsWith('/admin/') && !findItem(NAV_ITEMS)) {
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length -1];
        // Capitalize first letter and replace hyphens
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    }
    return findItem(NAV_ITEMS) || APP_NAME;
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
                  <AppLogo className="h-8 w-8" />
                  <span>{APP_NAME}</span>
                </Link>
              </div>
              <MainSidebar />
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <h1 className="text-lg font-semibold">{getCurrentPageLabel()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Pesquisar..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] rounded-full" />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" className="h-8 w-8 rounded-full" />
          ) : (
            <UserCircle className="h-6 w-6" />
          )}
          <span className="sr-only">Perfil do Usuário</span>
        </Button>
      </div>
    </header>
  );
};

export default MainHeader;
