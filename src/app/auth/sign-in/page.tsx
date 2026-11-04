import { redirect } from 'next/navigation';
import Link from 'next/link';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { SubmitButton } from '@/features/shared/ui/control/button/SubmitButton';
import { inputTextClassName } from '@/features/shared/ui/control/input/inputTextClassName';
import { Form } from '@/features/shared/ui/form/Form';
import { FormErrorList } from '@/features/shared/ui/form/FormErrorList';
import { isSignUpEnabled } from '@/features/auth/auth';
import { signInWithEmail } from '@/features/auth/data-access/AuthDataAccess';
import { isUserAuthenticated } from '@/features/app/users/data-access/UsersDataAccess';

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
  /*
   * Redirect authenticated users to the app.
   */
  const isAuthenticated = await isUserAuthenticated();
  if (isAuthenticated) redirect('/app/today');
  /**/

  return (
    <div className="flex flex-col">
      <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your OpenTask account.</p>
      <Form action={signInWithEmail} className="mt-6">
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
          autoComplete="current-password"
          className={`${inputTextClassName} mb-6 mt-1.5`}
          required
        />
        <FormErrorList />
        <SubmitButton className={`${buttonGreenClassName} flex w-full justify-center`}>
          Sign in
        </SubmitButton>
      </Form>
      {isSignUpEnabled() && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account yet?{' '}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}
