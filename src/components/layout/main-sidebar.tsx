
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, NavItem, APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLogo from '@/components/icons/app-logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MainSidebar = () => {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
    
    if (item.subItems && item.subItems.length > 0) {
      // Determine if any sub-item is active to keep the accordion open
      const isParentActive = item.subItems.some(sub => pathname.startsWith(sub.path));
      const defaultAccordionValue = isParentActive ? [item.path] : [];
      
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
              {item.subItems.map(subItem => renderNavItem(subItem, true))}
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
    const section = item.section || 'Geral';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);
  
  const activeAccordionItems = NAV_ITEMS.filter(item => item.subItems && item.subItems.some(sub => pathname.startsWith(sub.path))).map(item => item.path);

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
                {items.map(item => renderNavItem(item))}
              </nav>
            </div>
          ))}
        </Accordion>
      </ScrollArea>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button variant="outline" className="w-full text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground">
          Perfil do Usuário
        </Button>
      </div>
    </aside>
  );
};

export default MainSidebar;
