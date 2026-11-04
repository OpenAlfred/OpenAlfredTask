import { PageHeader } from '@/features/app/shared/ui/PageHeader';
import { AccountSettings } from '@/features/app/settings/account/ui/AccountSettings';

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" />
      <AccountSettings />
    </div>
  );
}
