import 'server-only';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { Logo } from '@/features/shared/ui/logo/Logo';
import { SettingsMenu } from '@/features/app/settings/ui/SettingsMenu';
import { getUser } from '@/features/app/users/data-access/UsersDataAccess';
import { MainMenu } from './MainMenu';

export const Sidebar = async ({ className }: ClassNamePropsOptional) => {
  const user = await getUser();

  return (
    <aside
      className={twMerge(
        'flex w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:w-72',
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link href="/app/today" className="-m-1.5 rounded-lg p-1.5">
          <Logo displayText height="1.5rem" width="1.5rem" />
        </Link>
      </div>
      <MainMenu className="flex-1 px-3 pb-4" />
      <div className="shrink-0 border-t border-border p-3">
        <SettingsMenu userEmail={user.email} userName={user.name} variant="full" />
      </div>
    </aside>
  );
};
