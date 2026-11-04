'use client';

import 'client-only';
import { useRouter } from 'next/navigation';
import { Switch } from '@/features/shared/ui/control/switch/Switch';
import { PageHeader } from '@/features/app/shared/ui/PageHeader';

interface ProjectsPageHeaderProps {
  readonly archived?: boolean;
}

export const ProjectsPageHeader = ({ archived = false }: ProjectsPageHeaderProps) => {
  const router = useRouter();

  const onSwitchClick = (enabled: boolean) => {
    const path = enabled ? 'archived' : 'active';
    router.push(path);
  };

  return (
    <PageHeader
      title="Projects"
      actions={
        <>
          <p className="text-sm text-muted-foreground">Show archived</p>
          <Switch enabled={archived} onClick={onSwitchClick} />
        </>
      }
    />
  );
};
