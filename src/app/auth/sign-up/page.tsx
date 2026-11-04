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
    <div className="pb-20">
      <h2 className="mb-9 mt-8 text-center text-xl font-semibold text-gray-900">Create account</h2>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {isSignUpEnabled() ? (
          <Form action={signUpWithEmail}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Name <span className="font-normal text-gray-600">(optional)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={500}
              className={`${inputTextClassName} mb-6 mt-2`}
            />
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
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              className={`${inputTextClassName} mt-2`}
              required
            />
            <p className="mb-6 mt-2 text-xs text-gray-600">At least 8 characters.</p>
            <FormErrorList />
            <SubmitButton className={`${buttonGreenClassName} flex w-full justify-center`}>
              Create account
            </SubmitButton>
          </Form>
        ) : (
          <p className="text-center text-sm text-gray-600">Sign-ups are disabled on this server.</p>
        )}
        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="underline hover:text-green-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
