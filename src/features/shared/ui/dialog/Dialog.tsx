'use client';

import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { twJoin, twMerge } from 'tailwind-merge';
import { ChildrenProps } from '@/features/shared/ui/ChildrenProps';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { buttonIconClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { XIcon } from '@/features/shared/ui/icon/XIcon';
import { RouterAction } from '@/features/shared/routing/RouterActions';
import { useRouterAction } from '@/features/shared/routing/useRouterAction';

/*
 * Scrollable overlay
 * "Move the content inside the overlay to render a dialog with overflow."
 * Ref: https://www.radix-ui.com/primitives/docs/components/dialog#scrollable-overlay
 *
 * We want to have a fade-in / fade-out only in the overlay on mobile, but since we have to
 * move content inside the overlay to have it scrollable, if we animate Dialog.Overlay we also
 * animate Dialog.Content. So we make Dialog.Overlay invisible, and inside it we have
 * a visible one animated, that doesn't wrap Dialog.Content.
 * But we need some animation on Dialog.Overlay in order for Radix to hold its DOM element while
 * the Dialog exit animation plays.
 * So we have this "fake" animation from opacity: 1 to opacity: 1 on Dialog.Overlay.
 */
export const invisibleOverlayFakeAnimation =
  '[state=open]:animate-[fake-fade_200ms_ease-out] data-[state=closed]:animate-[fake-fade_200ms_ease-out]';
export const invisibleOverlayClassNames = `group/overlay fixed inset-0 w-full h-full top-0 left-0 right-0 bottom-0 overflow-y-auto ${invisibleOverlayFakeAnimation}`;
/**/

export const visibleOverlayAnimation =
  'group-data-[state=open]/overlay:animate-[fade-in_200ms_ease-out] group-data-[state=closed]/overlay:animate-[fade-out_200ms_ease-out]';
export const visibleOverlayClassNames = `fixed inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60 ${visibleOverlayAnimation}`;

export const dialogContentAnimationSm = `data-[state=open]:animation-dialog-content-show-sm data-[state=closed]:animation-dialog-content-hide-sm`;
export const dialogContentAnimationMd = `md:data-[state=open]:animate-[dialog-content-show-md_250ms_ease-out] md:data-[state=closed]:animate-[dialog-content-hide-md_150ms_ease-in]`;
export const dialogContentClassNames = `flex flex-col mx-auto w-full rounded-t-2xl md:rounded-2xl bg-card p-5 sm:p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none md:w-[38rem] translate-y-[10%] md:translate-y-0 ${dialogContentAnimationSm} ${dialogContentAnimationMd}`;

interface DialogProps extends ChildrenProps, ClassNamePropsOptional {
  readonly defaultOpen?: boolean;
  readonly headerButtons?: React.ReactNode;
  readonly noCloseButton?: boolean;
  readonly onOpenAutoFocus?: (event: Event) => void;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly routerActionOnClose?: RouterAction;
  readonly title?: React.ReactNode;
  readonly trigger?: React.ReactNode;
}

export const Dialog = ({
  children,
  className,
  defaultOpen,
  headerButtons,
  noCloseButton,
  onOpenAutoFocus,
  onOpenChange,
  open,
  routerActionOnClose,
  title,
  trigger,
}: DialogProps) => {
  const [isOpen, setIsOpen] = useState(open || defaultOpen);
  const routerAction = useRouterAction(routerActionOnClose);

  const _onOpenChange = (_open: boolean) => {
    setIsOpen(_open);

    if (_open) {
      if (onOpenChange) onOpenChange(_open);
    } else {
      setTimeout(() => {
        routerAction();
        if (onOpenChange) onOpenChange(_open);
      }, 300);
    }
  };

  return (
    <DialogPrimitive.Root
      defaultOpen={defaultOpen}
      {...(open === undefined
        ? { open: isOpen, onOpenChange: _onOpenChange }
        : { open, onOpenChange })}
    >
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={twMerge(invisibleOverlayClassNames, 'z-40')}>
          <div className={visibleOverlayClassNames} aria-hidden="true" />
          <div className="flex fixed inset-0 md:items-center">
            <DialogPrimitive.Content
              className={twMerge(dialogContentClassNames, className)}
              onOpenAutoFocus={onOpenAutoFocus}
            >
              <div
                className={twJoin(
                  'flex justify-between',
                  title ? 'items-center' : 'items-start h-[90%] md:h-full gap-x-3',
                )}
              >
                {title ? (
                  <DialogPrimitive.Title className="text-lg font-semibold tracking-tight">
                    {title}
                  </DialogPrimitive.Title>
                ) : (
                  children
                )}
                <div className="-mr-1.5 flex flex-row gap-x-1">
                  {headerButtons}
                  {!noCloseButton && (
                    <DialogPrimitive.Close className={buttonIconClassName}>
                      <span className="sr-only">Close</span>
                      <XIcon aria-hidden="true" width="1.25rem" height="1.25rem" />
                    </DialogPrimitive.Close>
                  )}
                </div>
              </div>
              {title && children}
            </DialogPrimitive.Content>
          </div>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
