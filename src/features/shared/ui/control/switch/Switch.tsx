'use client';

import 'client-only';
import { useState } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { twJoin } from 'tailwind-merge';

interface SwitchProps {
  readonly enabled?: boolean;
  readonly onClick: (enabled: boolean) => void;
}

export const Switch = ({ enabled = false, onClick }: SwitchProps) => {
  const [_enabled, setEnabled] = useState(enabled);

  const onSwitchClick = (__enabled: boolean) => {
    setEnabled(__enabled);
    onClick(__enabled);
  };

  return (
    <HeadlessSwitch
      checked={_enabled}
      onChange={onSwitchClick}
      className={twJoin(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        _enabled ? 'bg-primary' : 'bg-input',
      )}
    >
      <span className="sr-only">Toggle between active and archived projects</span>
      <span
        className={twJoin(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition',
          _enabled ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
        )}
      />
    </HeadlessSwitch>
  );
};
