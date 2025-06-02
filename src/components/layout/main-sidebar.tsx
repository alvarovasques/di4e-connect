
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, NavItem, APP_NAME } from '@/lib/constants';
import { MOCK_CURRENT_USER, MOCK_ROLES } from '@/lib/mock-data'; // Import mock data
import type { PermissionId, Role } from '@/types'; // Import PermissionId
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLogo from '@/components/icons/app-logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Helper function to get user permissions (simulated)
const getUserPermissions = (currentUser: typeof MOCK_CURRENT_USER, roles: Role[]): Set<PermissionId> => {
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
  const currentUserPermissions = getUserPermissions(MOCK_CURRENT_USER, MOCK_ROLES);

  const hasPermission = (permissionId?: PermissionId): boolean => {
    if (!permissionId) return true; // If no permission is required, always show
    return currentUserPermissions.has(permissionId);
  };

  const renderNavItem = (item: NavItem, isSubItem = false): JSX.Element | null => {
    if (!hasPermission(item.requiredPermission)) {
      return null; // Do not render if user doesn't have permission
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

    // Render as a direct link if no visible sub-items or not a parent
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
    if (!hasPermission(item.requiredPermission)) return acc; // Skip whole section if no permission
    
    const visibleSubItems = item.subItems?.filter(subItem => hasPermission(subItem.requiredPermission));
    const itemToPush = {...item};
    if (item.subItems) {
        if (visibleSubItems && visibleSubItems.length > 0) {
            itemToPush.subItems = visibleSubItems;
        } else if (visibleSubItems && visibleSubItems.length === 0) {
            // If it's a parent item but has no visible children, don't show it unless it's a link itself
             if(!item.path || item.path === '/admin'){ // Example condition: if parent is just a grouper
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


  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-headline text-xl font-semibold text-primary">
          <AppLogo className="h-8 w-8" />
          <span>{APP_NAME}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
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
      </ScrollArea>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button variant="outline" className="w-full text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground">
          Perfil: {MOCK_CURRENT_USER.name}
        </Button>
      </div>
    </aside>
  );
};

export default MainSidebar;
