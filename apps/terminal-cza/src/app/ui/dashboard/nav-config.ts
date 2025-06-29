// app/ui/dashboard/nav-config.ts
import {
  HomeIcon,
  UserIcon,
  FolderIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const rootLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
  { name: 'Users', href: '/dashboard/users', icon: UserIcon },
  { name: 'Usage', href: '/dashboard/usage', icon: ChartBarIcon },
];

export const projectLinks = [
  { name: 'Overview', href: '/dashboard/projects/[id]/overview', icon: HomeIcon },
  { name: 'Settings', href: '/dashboard/projects/[id]/settings', icon: FolderIcon },
  { name: 'Members', href: '/dashboard/projects/[id]/members', icon: UserIcon },
];
