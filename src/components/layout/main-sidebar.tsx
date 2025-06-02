
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, NavItem, APP_NAME } from '@/lib/constants';
import { 
  MOCK_CURRENT_USER_FOR_INITIAL_RENDER, 
  getClientSideCurrentUser, 
  MOCK_ROLES, 
  MOCK_USERS 
} from '@/lib/mock-data'; 
import type { PermissionId, Role, User } from '@/types'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLogo from '@/components/icons/app-logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useEffect } from 'react';

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
  const [currentUser, setCurrentUser] = useState<User>(MOCK_CURRENT_USER_FOR_INITIAL_RENDER);
  const [isClient, setIsClient] = useState(false);
  const [groupedNavItems, setGroupedNavItems] = useState<Record<string, NavItem[]>>({});
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    const clientUser = getClientSideCurrentUser();
    setCurrentUser(clientUser);
  }, []);

  useEffect(() => {
    // Recalculate permissions and nav items when currentUser changes
    const permissions = getUserPermissions(currentUser, MOCK_ROLES);
    const hasPermission = (permissionId?: PermissionId): boolean => {
      if (!permissionId) return true;
      return permissions.has(permissionId);
    };

    const newGroupedNavItems = NAV_ITEMS.reduce((acc, item) => {
      if (!hasPermission(item.requiredPermission)) return acc;
      const visibleSubItems = item.subItems?.filter(subItem => hasPermission(subItem.requiredPermission));
      const itemToPush = { ...item };
      if (item.subItems) {
        if (visibleSubItems && visibleSubItems.length > 0) {
          itemToPush.subItems = visibleSubItems;
        } else if (visibleSubItems && visibleSubItems.length === 0) {
          if (!item.path || item.path === '/admin') {
            return acc;
          }
        }
      }
      const section = item.section || 'Geral';
      if (!acc[section]) acc[section] = [];
      acc[section].push(itemToPush);
      return acc;
    }, {} as Record<string, NavItem[]>);
    setGroupedNavItems(newGroupedNavItems);

    const newActiveAccordionItems = NAV_ITEMS
      .filter(item => {
        const visibleSubItems = item.subItems?.filter(sub => hasPermission(sub.requiredPermission));
        return visibleSubItems && visibleSubItems.some(sub => pathname.startsWith(sub.path)) && hasPermission(item.requiredPermission);
      })
      .map(item => item.path);
    setActiveAccordionItems(newActiveAccordionItems);

  }, [currentUser, pathname]);


  const renderNavItem = (item: NavItem, isSubItem = false): JSX.Element | null => {
    // Permission check is now implicitly handled by groupedNavItems calculation
    const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    const visibleSubItems = item.subItems || []; // Already filtered by hasPermission in useEffect

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
  
  const displayedUserName = isClient ? currentUser.name : MOCK_CURRENT_USER_FOR_INITIAL_RENDER.name;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
          <AppLogo className="h-8 w-8" />
          <span>{APP_NAME}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        {/* Always render Accordion, content filtering happens via groupedNavItems state */}
        <Accordion type="multiple" className="w-full px-3 py-4" defaultValue={activeAccordionItems} key={currentUser.id}> {/* Added key to re-mount on user change if needed */}
          {Object.entries(groupedNavItems).map(([section, items]) => (
            <div key={section} className="mb-4">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">{section}</h3>
              <nav className="flex flex-col gap-1">
                {items.map(item => renderNavItem(item)).filter(Boolean)}
              </nav>
            </div>
          ))}
           {/* Show skeleton only if client hasn't mounted AND there are no items (e.g. initial load, permissions not yet calc) */}
          {!isClient && Object.keys(groupedNavItems).length === 0 && (
             <div className="p-4 space-y-2"> 
                {[...Array(5)].map((_, i) => <div key={`skel-${i}`} className="h-8 bg-muted/50 rounded animate-pulse" />)}
             </div>
          )}
        </Accordion>
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

    