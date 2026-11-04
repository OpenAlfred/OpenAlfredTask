import { format } from 'date-fns';
import { PageHeader } from '@/features/app/shared/ui/PageHeader';

export const TodayPageHeader = () => (
  <PageHeader title="Today" subtitle={format(new Date(), 'EEEE, MMMM d')} />
);
