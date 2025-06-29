'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface LinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export default function NavLinks({ links }: { links: LinkItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center border-white border-b-2 gap-2 border-r-2 bg-neutral-800 p-3 text-sm font-medium text-gray-300 hover:bg-neutral-700 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-neutral-700 text-white': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
