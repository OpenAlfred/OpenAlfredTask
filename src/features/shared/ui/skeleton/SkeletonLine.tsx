import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';

export const SkeletonLine = ({ className }: ClassNamePropsOptional) => {
  return <div className={twMerge('h-4 bg-muted rounded-md w-full', className)} />;
};
