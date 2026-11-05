import Link from 'next/link';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { PlusSignalIcon } from '@/features/shared/ui/icon/PlusSignalIcon';
import { LogoIcon } from '@/features/shared/ui/logo/LogoIcon';
import { getProjects } from '@/features/app/projects/data-access/ProjectsDataAccess';

export default async function OnboardingPage() {
  const { data: projects, errors } = await getProjects();
  if (errors) return <ErrorList errors={errors} />;
  if (projects && projects.length > 0) redirect('/app/today');

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <LogoIcon width="4.5rem" height="4.5rem" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Welcome to OpenAlfred!</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        You don&#39;t have any projects yet. Create your first one to start adding tasks.
      </p>
      <Link href="/app/projects/new" className={twMerge(buttonGreenClassName, 'mt-8 pl-3')}>
        <PlusSignalIcon aria-hidden="true" width="1.25rem" height="1.25rem" />
        Create your first project
      </Link>
    </div>
  );
}
