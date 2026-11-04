import 'server-only';
import { twMerge } from 'tailwind-merge';
import { buttonRedClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { AlertDialog, AlertDialogBody } from '@/features/shared/ui/dialog/AlertDialog';
import { Form } from '@/features/shared/ui/form/Form';
import { FormErrorList } from '@/features/shared/ui/form/FormErrorList';
import { deleteUserAccount, getUser } from '@/features/app/users/data-access/UsersDataAccess';

export const AccountSettings = async () => {
  const user = await getUser();

  const deleteButton = (
    <button type="button" className={twMerge(buttonRedClassName, 'mt-4 self-start')}>
      Delete account
    </button>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      <section className="rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold">Account</h2>
        <dl className="mt-3 grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="truncate">{user.name}</dd>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="truncate">{user.email}</dd>
        </dl>
      </section>
      <section className="flex flex-col rounded-xl border border-destructive/30 p-5">
        <h2 className="text-sm font-semibold text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You will immediately delete all your data, including your projects and tasks. You
          can&apos;t undo it.
        </p>
        <AlertDialog
          body={
            <Form action={deleteUserAccount}>
              <AlertDialogBody
                confirmButtonLabel="Delete"
                destructive
                message={
                  <span>
                    Are you sure you want to delete you account and all data associated to it?
                  </span>
                }
                onConfirm="submit"
              />
              <FormErrorList />
            </Form>
          }
          title="Delete User Account"
          trigger={deleteButton}
        />
      </section>
    </div>
  );
};
