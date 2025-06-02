
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, NavItem, APP_NAME } from '@/lib/constants';
// Import MOCK_USERS to determine client-side user
import { MOCK_CURRENT_USER as INITIAL_MOCK_CURRENT_USER, MOCK_ROLES, MOCK_USERS } from '@/lib/mock-data'; 
import type { PermissionId, Role, User } from '@/types'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLogo from '@/components/icons/app-logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect } from 'react'; // Import useState and useEffect

// Helper function to get user permissions (simulated)
// This function will now use the currentUser passed to it, which will be stateful
const getUserPermissions = (currentUser: User, roles: Role[]): Set<PermissionId> => {
  if (!currentUser.roleId) {
    return new Set();
  }
  const userRole = roles.find(role => role.id === currentUser.roleId);
  if (!userRole) {
    return new Set();
  }
  return new Set(userRole.permissions);
};

const MainSidebar = () => {
  const pathname = usePathname();
  // State for the current user, initialized with the server-rendered/initial MOCK_CURRENT_USER
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_MOCK_CURRENT_USER);
  // State to track if component has mounted on client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial mount
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
    // If localStorage is not set or doesn't match, it defaults to INITIAL_MOCK_CURRENT_USER
    // or the logic above handles it.
    
    setCurrentUser(clientDeterminedUser);
  }, []); // Empty dependency array ensures this runs once on mount

  // Permissions are now derived from the stateful currentUser
  const currentUserPermissions = getUserPermissions(currentUser, MOCK_ROLES);

  const hasPermission = (permissionId?: PermissionId): boolean => {
    if (!permissionId) return true; 
    return currentUserPermissions.has(permissionId);
  };

  const renderNavItem = (item: NavItem, isSubItem = false): JSX.Element | null => {
    if (!hasPermission(item.requiredPermission)) {
      return null; 
    }

    const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    const visibleSubItems = item.subItems?.filter(subItem => hasPermission(subItem.requiredPermission)) || [];

    if (visibleSubItems.length > 0) {
      const isParentActive = visibleSubItems.some(sub => pathname.startsWith(sub.path));
      
      return (
        <AccordionItem value={item.path} key={item.path} className="border-none">
          <AccordionTrigger
            className={cn(
              "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
              isParentActive && !isSubItem ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-sidebar-foreground",
              isSubItem && "pl-8"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", isParentActive ? "text-primary-foreground" : "text-primary")} />
              <span className={cn(isParentActive && !isSubItem ? "font-semibold" : "")}>{item.label}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <nav className="flex flex-col gap-1">
              {visibleSubItems.map(subItem => renderNavItem(subItem, true))}
            </nav>
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Button
        key={item.path}
        asChild
        variant={'ghost'}
        className={cn(
          "w-full justify-start gap-3",
          isSubItem && "pl-8 py-1.5 h-auto text-xs",
          !isSubItem && "py-2 h-auto text-sm",
          isActive && isSubItem ? "bg-primary/10 text-primary font-semibold" : "",
          isActive && !isSubItem ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
          !isActive && "text-sidebar-foreground"
        )}
      >
        <Link href={item.path}>
          <item.icon className={cn("h-5 w-5", isActive && !isSubItem ? "" : "text-primary")} />
          {item.label}
        </Link>
      </Button>
    );
  };

  const groupedNavItems = NAV_ITEMS.reduce((acc, item) => {
    if (!hasPermission(item.requiredPermission)) return acc; 
    
    const visibleSubItems = item.subItems?.filter(subItem => hasPermission(subItem.requiredPermission));
    const itemToPush = {...item};
    if (item.subItems) {
        if (visibleSubItems && visibleSubItems.length > 0) {
            itemToPush.subItems = visibleSubItems;
        } else if (visibleSubItems && visibleSubItems.length === 0) {
             if(!item.path || item.path === '/admin'){ 
                 return acc;
             }
        }
    }

    const section = item.section || 'Geral';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(itemToPush);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const activeAccordionItems = NAV_ITEMS
    .filter(item => {
        const visibleSubItems = item.subItems?.filter(sub => hasPermission(sub.requiredPermission));
        return visibleSubItems && visibleSubItems.some(sub => pathname.startsWith(sub.path)) && hasPermission(item.requiredPermission);
    })
    .map(item => item.path);

  // Determine the name to display. For SSR and initial client render, use INITIAL_MOCK_CURRENT_USER.
  // After client mount and useEffect, use the stateful currentUser.name.
  const displayedUserName = isClient ? currentUser.name : INITIAL_MOCK_CURRENT_USER.name;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
          <AppLogo className="h-8 w-8" />
          <span>{APP_NAME}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        {isClient ? ( // Only render accordion and nav items once client state is confirmed
          <Accordion type="multiple" className="w-full px-3 py-4" defaultValue={activeAccordionItems}>
            {Object.entries(groupedNavItems).map(([section, items]) => (
              <div key={section} className="mb-4">
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">{section}</h3>
                <nav className="flex flex-col gap-1">
                  {items.map(item => renderNavItem(item)).filter(Boolean)}
                </nav>
              </div>
            ))}
          </Accordion>
        ) : (
          // Render a placeholder or skeleton during SSR and initial client render for nav items
          <div className="p-4 space-y-2"> 
            {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />)}
          </div>
        )}
      </ScrollArea>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button variant="outline" className="w-full text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground">
          Perfil: {displayedUserName}
        </Button>
      </div>
    </aside>
  );
};

export default MainSidebar;
