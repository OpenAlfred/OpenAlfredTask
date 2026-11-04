import { redirect } from 'next/navigation';
import Link from 'next/link';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { SubmitButton } from '@/features/shared/ui/control/button/SubmitButton';
import { inputTextClassName } from '@/features/shared/ui/control/input/inputTextClassName';
import { Form } from '@/features/shared/ui/form/Form';
import { FormErrorList } from '@/features/shared/ui/form/FormErrorList';
import { isSignUpEnabled } from '@/features/auth/auth';
import { signUpWithEmail } from '@/features/auth/data-access/AuthDataAccess';
import { isUserAuthenticated } from '@/features/app/users/data-access/UsersDataAccess';

export const dynamic = 'force-dynamic';

export default async function SignUpPage() {
  /*
   * Redirect authenticated users to the app.
   */
  const isAuthenticated = await isUserAuthenticated();
  if (isAuthenticated) redirect('/app/today');
  /**/

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start organizing your tasks.</p>
      {isSignUpEnabled() ? (
        <Form action={signUpWithEmail} className="mt-6">
          <label htmlFor="name" className="block text-sm font-medium">
            Name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={500}
            className={`${inputTextClassName} mb-4 mt-1.5`}
          />
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${inputTextClassName} mb-4 mt-1.5`}
            required
          />
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            className={`${inputTextClassName} mt-1.5`}
            required
          />
          <p className="mb-6 mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
          <FormErrorList />
          <SubmitButton className={`${buttonGreenClassName} flex w-full justify-center`}>
            Create account
          </SubmitButton>
        </Form>
      ) : (
        <p className="mt-6 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Sign-ups are disabled on this server.
        </p>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
