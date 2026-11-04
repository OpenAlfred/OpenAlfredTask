'use client';

import { useState } from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { twMerge } from 'tailwind-merge';
import {
  buttonGreenClassName,
  buttonRedClassName,
  buttonWhiteClassName,
} from '@/features/shared/ui/control/button/buttonClassName';
import { SubmitButton } from '@/features/shared/ui/control/button/SubmitButton';
import { RouterAction } from '@/features/shared/routing/RouterActions';
import { useRouterAction } from '@/features/shared/routing/useRouterAction';
import {
  dialogContentClassNames,
  invisibleOverlayClassNames,
  visibleOverlayClassNames,
} from './Dialog';

export interface AlertDialogBodyProps {
  readonly cancelButtonLabel?: string;
  readonly confirmButtonLabel: string;
  readonly confirmButtonLabelSubmitting?: React.ReactNode;
  readonly destructive?: boolean;
  readonly message: string | React.ReactNode;
  readonly onConfirm: (() => void) | 'submit';
}

export const AlertDialogBody = ({
  cancelButtonLabel = 'Cancel',
  confirmButtonLabel,
  confirmButtonLabelSubmitting,
  destructive = false,
  message,
  onConfirm,
}: AlertDialogBodyProps) => {
  const confirmButtonClassName = destructive ? buttonRedClassName : buttonGreenClassName;

  const submitButton =
    onConfirm === 'submit' ? (
      <AlertDialogPrimitive.Action asChild>
        <SubmitButton className={confirmButtonClassName} submitting={confirmButtonLabelSubmitting}>
          {confirmButtonLabel}
        </SubmitButton>
      </AlertDialogPrimitive.Action>
    ) : (
      <AlertDialogPrimitive.Action asChild>
        <button type="button" className={confirmButtonClassName} onClick={onConfirm}>
          {confirmButtonLabel}
        </button>
      </AlertDialogPrimitive.Action>
    );

  return (
    <div className="flex flex-col">
      <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
        {message}
      </AlertDialogPrimitive.Description>
      <div className="mt-6 flex justify-end gap-3">
        <AlertDialogPrimitive.Cancel className={buttonWhiteClassName}>
          {cancelButtonLabel}
        </AlertDialogPrimitive.Cancel>
        {submitButton}
      </div>
    </div>
  );
};

export interface AlertDialogProps {
  readonly body: React.ReactNode;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly open?: boolean;
  readonly routerActionOnClose?: RouterAction;
  readonly title: string | React.ReactNode;
  readonly trigger?: React.ReactNode;
}

export const AlertDialog = ({
  body,
  defaultOpen,
  onOpenChange,
  open,
  routerActionOnClose,
  title,
  trigger,
}: AlertDialogProps) => {
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
    <AlertDialogPrimitive.Root
      defaultOpen={defaultOpen}
      {...(open === undefined && !trigger
        ? { open: isOpen, onOpenChange: _onOpenChange }
        : { open, onOpenChange })}
    >
      {trigger && <AlertDialogPrimitive.Trigger asChild>{trigger}</AlertDialogPrimitive.Trigger>}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={twMerge(invisibleOverlayClassNames, 'z-50')}>
          <div className={visibleOverlayClassNames} aria-hidden="true" />
          <div className="flex fixed inset-0 md:items-center z-50">
            <AlertDialogPrimitive.Content
              className={twMerge(dialogContentClassNames, 'md:w-[28rem]')}
            >
              <AlertDialogPrimitive.Title className="text-lg font-semibold tracking-tight">
                {title}
              </AlertDialogPrimitive.Title>
              {body}
            </AlertDialogPrimitive.Content>
          </div>
        </AlertDialogPrimitive.Overlay>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
