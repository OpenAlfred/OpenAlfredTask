import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';

export interface PageHeaderProps extends ClassNamePropsOptional {
  readonly actions?: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly title: React.ReactNode;
}

/*
 * Sticks to the top of the scrolling content. The negative margins stretch its background over
 * the horizontal padding of the content column in the app layout.
 */
export const PageHeader = ({ actions, className, subtitle, title }: PageHeaderProps) => (
  <div
    className={twMerge(
      'sticky top-0 z-10 -mx-4 flex items-center justify-between gap-4 bg-background/85 px-4 pb-4 pt-6 backdrop-blur-md sm:-mx-8 sm:px-8 md:pt-10',
      className,
    )}
  >
    <div className="flex min-w-0 flex-col">
      <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
  </div>
);
