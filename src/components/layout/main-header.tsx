
'use client';

import { Bell, Search, UserCircle, Menu, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MainSidebar from "./main-sidebar";
import { APP_NAME } from '@/lib/constants';
import AppLogo from '@/components/icons/app-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
// Import MOCK_USERS to determine client-side user and INITIAL_MOCK_CURRENT_USER
import { MOCK_CURRENT_USER as INITIAL_MOCK_CURRENT_USER, setSimulatedUserType, MOCK_USERS } from '@/lib/mock-data';
import type { User } from '@/types';
import { useState, useEffect } from 'react';

const MainHeader = () => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_MOCK_CURRENT_USER);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    // Determine the actual MOCK_CURRENT_USER on the client side based on localStorage
    const simulatedUserType = localStorage.getItem('simulatedUserType');
    let clientDeterminedUser = INITIAL_MOCK_CURRENT_USER; // Default to initial

    const adminUser = MOCK_USERS.find(u => u.userType === 'ADMIN');
    const supervisorUser = MOCK_USERS.find(u => u.userType === 'SUPERVISOR');
    const agentUser = MOCK_USERS.find(u => u.userType === 'AGENT_HUMAN');

    if (simulatedUserType === 'AGENT_HUMAN' && agentUser) {
      clientDeterminedUser = agentUser;
    } else if (simulatedUserType === 'SUPERVISOR' && supervisorUser) {
      clientDeterminedUser = supervisorUser;
    } else if (simulatedUserType === 'ADMIN' && adminUser) {
      clientDeterminedUser = adminUser;
    }
    setCurrentUser(clientDeterminedUser);
  }, []);

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
    if (pathname.startsWith('/admin/') && !findItem(NAV_ITEMS)) {
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length -1];
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    }
    if (pathname.startsWith('/supervisor/chat/')) {
        return "Supervisão de Chat";
    }
    return findItem(NAV_ITEMS) || APP_NAME;
  };

  const handleToggleUser = () => {
    // setSimulatedUserType already reloads the page
    if (currentUser.userType === 'SUPERVISOR') {
      setSimulatedUserType('AGENT_HUMAN');
    } else if (currentUser.userType === 'AGENT_HUMAN') {
      setSimulatedUserType('ADMIN');
    } else { // ADMIN or other
      setSimulatedUserType('SUPERVISOR');
    }
  };

  const agentUser = MOCK_USERS.find(u => u.id === 'user_1');
  const supervisorUser = MOCK_USERS.find(u => u.id === 'user_2');
  const adminUser = MOCK_USERS.find(u => u.id === 'user_4');

  let toggleButtonText = "";
  if (currentUser.userType === 'SUPERVISOR' && agentUser) {
    toggleButtonText = `Agente (${agentUser.name.split(' ')[0]})`;
  } else if (currentUser.userType === 'AGENT_HUMAN' && adminUser) {
    toggleButtonText = `Admin (${adminUser.name.split(' ')[0]})`;
  } else if (currentUser.userType === 'ADMIN' && supervisorUser){
    toggleButtonText = `Superv. (${supervisorUser.name.split(' ')[0]})`;
  } else { // Fallback
     toggleButtonText = supervisorUser ? `Superv. (${supervisorUser.name.split(' ')[0]})` : "Alternar";
  }

  // Use INITIAL_MOCK_CURRENT_USER for SSR and initial client render for elements that might mismatch
  const displayedCurrentUser = isClient ? currentUser : INITIAL_MOCK_CURRENT_USER;

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

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Pesquisar..." className="pl-8 sm:w-[200px] md:w-[250px] lg:w-[300px] rounded-full text-sm" />
        </div>

        <Button onClick={handleToggleUser} variant="outline" size="sm" className="text-xs sm:text-sm" title={`Logado como: ${displayedCurrentUser.name} (${displayedCurrentUser.userType})`}>
          <Users2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Alternar para: </span>
           {toggleButtonText}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          {displayedCurrentUser.avatarUrl ? (
            <img src={displayedCurrentUser.avatarUrl} alt={displayedCurrentUser.name} data-ai-hint="user avatar" className="h-8 w-8 rounded-full border" />
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
