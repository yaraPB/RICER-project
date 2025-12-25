import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'fr'],
  defaultLocale: 'ar'  // ARABIC IS PRIMARY!
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
