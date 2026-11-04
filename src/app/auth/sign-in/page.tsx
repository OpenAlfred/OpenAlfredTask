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
    <div className="pb-20">
      <h2 className="mb-9 mt-8 text-center text-xl font-semibold text-gray-900">Sign in</h2>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Form action={signInWithEmail}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={`${inputTextClassName} mb-6 mt-2`}
            required
          />
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={`${inputTextClassName} mb-6 mt-2`}
            required
          />
          <FormErrorList />
          <SubmitButton className={`${buttonGreenClassName} flex w-full justify-center`}>
            Sign in
          </SubmitButton>
        </Form>
        {isSignUpEnabled() && (
          <p className="mt-6 text-sm text-gray-600">
            No account yet?{' '}
            <Link href="/auth/sign-up" className="underline hover:text-green-500">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
