import { redirect } from 'next/navigation';
import { Header } from '@/features/app/shared/ui/Header';
import { Sidebar } from '@/features/app/shared/ui/Sidebar';
import { InstallPwaDialog } from '@/features/shared/ui/pwa/InstallPwaDialog';
import { UpdateUserTimeZone } from '@/features/app/users/ui/UpdateUserTimeZone';
import { isUserAuthenticated } from '@/features/app/users/data-access/UsersDataAccess';

/*
 * Everything under /app depends on the session cookie. Without this, a build that can't read the
 * session would prerender these pages with a redirect to the sign-in page baked in.
 */
export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
  dialog,
}: {
  children: React.ReactNode;
  dialog: React.ReactNode;
}) {
  /*
   * Redirect unauthenticated users to the authentication page.
   */
  const isAuthenticated = await isUserAuthenticated();
  if (!isAuthenticated) redirect('/auth/sign-in');
  /**/

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <Sidebar className="hidden md:flex" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header className="md:hidden" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-24 sm:px-8">
            {children}
            {dialog}
          </div>
        </main>
      </div>
      <InstallPwaDialog />
      <UpdateUserTimeZone />
    </div>
  );
}
