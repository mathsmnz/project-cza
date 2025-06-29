'use client';

import NavLinks from '@/app/ui/dashboard/nav-links';
import { usePathname } from 'next/navigation';
import { rootLinks, projectLinks } from '@/app/ui/dashboard/nav-config';

export default function SideNav() {
  const pathname = usePathname();

  // Basic route matching logic (improve as needed)
  const isProject = pathname.startsWith('/dashboard/projects/') && pathname.split('/').length > 3;

  const activeLinks = isProject ? projectLinks : rootLinks;

  return (
    <div className="flex h-full flex-col">
      <div className="flex grow flex-row justify-between md:flex-col">
        <NavLinks links={activeLinks} />
        <div className="hidden h-auto w-full grow bg-neutral-800 md:block border-white border-r-2"></div>
      </div>
    </div>
  );
}
