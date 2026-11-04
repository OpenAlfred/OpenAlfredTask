'use client';

import 'client-only';
import { Fragment } from 'react';
import Link from 'next/link';
import { twJoin } from 'tailwind-merge';
import {
  DropdownMenu,
  getDropdownMenuItemClassName,
} from '@/features/shared/ui/control/dropdown/DropdownMenu';
import { Menu } from '@/features/shared/ui/control/dropdown/Menu';
import { ExpandLessIcon } from '@/features/shared/ui/icon/ExpandLessIcon';
import { SettingsIcon } from '@/features/shared/ui/icon/SettingsIcon';
import { LogoutIcon } from '@/features/shared/ui/icon/LogoutIcon';
import { signOut } from '@/features/app/users/data-access/UsersDataAccess';

export interface SettingsMenuProps {
  readonly userEmail: string;
  readonly userName: string;
  /*
   * "avatar" only shows the avatar (mobile header),
   * "full" also shows the name and opens upwards (bottom of the sidebar).
   */
  readonly variant?: 'avatar' | 'full';
}

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  const initials = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0];
  return (initials ?? '').toUpperCase();
};

export const SettingsMenu = ({ userEmail, userName, variant = 'avatar' }: SettingsMenuProps) => {
  const isFull = variant === 'full';

  const avatar = (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
    >
      {getInitials(userName)}
    </span>
  );

  const userDetails = (
    <span className="flex min-w-0 flex-col text-left">
      <span className="truncate text-sm font-medium text-foreground">{userName}</span>
      {userEmail !== userName && (
        <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
      )}
    </span>
  );

  return (
    <DropdownMenu
      className={isFull ? 'w-full' : 'flex'}
      itemsClassName={twJoin(
        'absolute z-20',
        isFull
          ? 'bottom-full left-0 mb-2 w-full origin-bottom'
          : 'right-0 top-10 w-60 origin-top-right',
      )}
      menuButton={
        <Menu.Button
          className={twJoin(
            'flex items-center transition-colors',
            isFull
              ? 'w-full gap-3 rounded-lg p-2 hover:bg-foreground/5'
              : 'rounded-full hover:opacity-80',
          )}
        >
          <span className="sr-only">Open user menu</span>
          {avatar}
          {isFull && (
            <>
              {userDetails}
              <ExpandLessIcon
                aria-hidden="true"
                className="ml-auto shrink-0 text-muted-foreground"
                width="1.25rem"
                height="1.25rem"
              />
            </>
          )}
        </Menu.Button>
      }
    >
      {!isFull && (
        <>
          <div className="flex px-2.5 py-2">{userDetails}</div>
          <div className="-mx-1 my-1 h-px bg-border" />
        </>
      )}
      <Menu.Item as={Fragment}>
        {({ active }: { active: boolean }) => (
          <Link href="/app/settings/account" className={getDropdownMenuItemClassName(active)}>
            <SettingsIcon className="text-muted-foreground" />
            Settings
          </Link>
        )}
      </Menu.Item>
      <Menu.Item as={Fragment}>
        {({ active }: { active: boolean }) => (
          <button onClick={async () => signOut()} className={getDropdownMenuItemClassName(active)}>
            <LogoutIcon className="text-muted-foreground" />
            Log out
          </button>
        )}
      </Menu.Item>
    </DropdownMenu>
  );
};
