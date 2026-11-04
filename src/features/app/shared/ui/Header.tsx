import 'server-only';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { buttonIconClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { HamburgerMenuIcon } from '@/features/shared/ui/icon/HamburgerMenuIcon';
import { Logo } from '@/features/shared/ui/logo/Logo';
import { SettingsMenu } from '@/features/app/settings/ui/SettingsMenu';
import { getUser } from '@/features/app/users/data-access/UsersDataAccess';

export const Header = async ({ className }: ClassNamePropsOptional) => {
  const user = await getUser();

  return (
    <header
      className={twMerge('flex w-full shrink-0 border-b border-border bg-background', className)}
    >
      <nav
        className="relative flex h-14 w-full items-center justify-between px-2"
        aria-label="Global"
      >
        <Link className={twMerge(buttonIconClassName, 'h-10 w-10')} href="/app/main-menu">
          <span className="sr-only">Open menu</span>
          <HamburgerMenuIcon aria-hidden="true" />
        </Link>
        <Link href="/app/today" className="absolute left-1/2 -translate-x-1/2 rounded-lg">
          <Logo displayText height="1.5rem" width="1.5rem" />
        </Link>
        <div className="pr-2">
          <SettingsMenu userEmail={user.email} userName={user.name} />
        </div>
      </nav>
    </header>
  );
};
