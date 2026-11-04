'use client';

import { useEffect } from 'react';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { WarningIcon } from '@/features/shared/ui/icon/WarningIcon';

export const DefaultError = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="mt-16 flex flex-col items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <WarningIcon aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">Something went wrong!</h3>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          className={`${buttonGreenClassName} mt-6`}
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Please try again
        </button>
      </div>
    </div>
  );
};
