'use client';

import 'client-only';
import { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { twMerge } from 'tailwind-merge';
import { ExpandMoreIcon } from '@/features/shared/ui/icon/ExpandMoreIcon';
import { ExpandLessIcon } from '@/features/shared/ui/icon/ExpandLessIcon';
import { CheckIcon } from '@/features/shared/ui/icon/CheckIcon';

export interface SelectItemProps extends SelectPrimitive.SelectItemProps {
  readonly value: string;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectPrimitive.SelectItemProps>(
  ({ children, className, ...props }: SelectPrimitive.SelectItemProps, forwardedRef) => {
    return (
      <SelectPrimitive.Item
        className={twMerge(
          'relative flex cursor-default select-none items-center rounded-md py-2 pl-8 pr-3 text-sm text-foreground outline-none',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          'data-[highlighted]:bg-muted data-[state=checked]:font-medium',
          className,
        )}
        {...props}
        ref={forwardedRef}
      >
        <SelectPrimitive.ItemIndicator className="absolute left-2 flex items-center text-primary">
          <CheckIcon width="1rem" height="1rem" />
        </SelectPrimitive.ItemIndicator>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';

export interface SelectProps extends SelectPrimitive.SelectProps {
  readonly ariaLabel: string;
  readonly items: Array<SelectItemProps>;
  readonly placeholder: string;
}

const scrollButtonClassName = 'flex h-6 items-center justify-center text-muted-foreground';

export const Select = ({ ariaLabel, items, placeholder, ...props }: SelectProps) => (
  <SelectPrimitive.Root {...props}>
    <SelectPrimitive.Trigger
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm text-foreground transition-colors hover:bg-muted data-[state=open]:bg-muted"
      aria-label={ariaLabel}
    >
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon className="text-muted-foreground">
        <ExpandMoreIcon width="1.125rem" height="1.125rem" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="z-[41] max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/40"
        position="popper"
        sideOffset={6}
      >
        <SelectPrimitive.ScrollUpButton className={scrollButtonClassName}>
          <ExpandLessIcon width="1.125rem" height="1.125rem" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1">
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.children}
            </SelectItem>
          ))}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className={scrollButtonClassName}>
          <ExpandMoreIcon width="1.125rem" height="1.125rem" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);
