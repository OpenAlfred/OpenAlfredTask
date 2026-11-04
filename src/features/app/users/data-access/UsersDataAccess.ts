'use server';

import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/features/auth/auth';
import { prisma } from '@/features/shared/data-access/prisma';
import {
  ServerResponse,
  createServerErrorResponse,
  createServerSuccessResponse,
} from '@/features/shared/data-access/ServerResponse';
import { genericAwareOfInternalErrorMessage } from '@/features/shared/ui/error/errorMessages';

export interface UserDto {
  readonly email: string;
  readonly name: string;
}

export interface ServerSideUserDto {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly timeZone: string;
}

export const deleteUserAccount = async (
  prevResponse: ServerResponse<undefined> | undefined,
  formData: FormData,
) => {
  let id;
  try {
    ({
      user: { id },
    } = await getUserSession());
  } catch (error) {
    console.error(error);

    // return the real error (the session has probably expired).
    return createServerErrorResponse<undefined>(error);
  }

  try {
    // Sessions and accounts are deleted along with the user (onDelete: Cascade).
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<undefined>(genericAwareOfInternalErrorMessage);
  }

  await signOut();
};

/*
 * Every data access function asks for the user, so cache() looks the session up once per request.
 */
const getUserSession = cache(async () => {
  const session = await getAuth().api.getSession({ headers: headers() });

  if (!session) throw new Error('Your session has expired. Please sign in again.');

  return session;
});

/*
 * We don't expose user's id to the client because it doesn't need it.
 */
export const getUser = async () => {
  const {
    user: { email, name },
  } = await getUserSession();

  const userDto: UserDto = {
    email,
    name: name || email,
  };

  return userDto;
};

/*
 * We don't want to expose user's id to the client because it doesn't need it,
 * so we have this extra function to be used server-side only.
 */
export const getServerSideUser = async () => {
  const {
    user: { email, id, name, timeZone },
  } = await getUserSession();

  const userDto: ServerSideUserDto = {
    email,
    id,
    name: name || email,
    timeZone: timeZone ?? '',
  };

  return userDto;
};
/**/

export const isUserAuthenticated = async () => {
  let isAuthenticated = true;
  try {
    await getUserSession();
  } catch {
    isAuthenticated = false;
  }

  return isAuthenticated;
};

export const signOut = async () => {
  try {
    await getAuth().api.signOut({ headers: headers() });
  } catch (error) {
    console.error(error);
  }

  redirect('/auth/sign-in');
};

export const updateTimeZone = async (timeZone: string) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
  } catch (error) {
    console.error(error);
    return createServerErrorResponse('Invalid time zone.');
  }

  try {
    const { id } = await getServerSideUser();

    const result = await prisma.user.update({
      where: { id },
      data: { timeZone },
    });

    return createServerSuccessResponse(result);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse(genericAwareOfInternalErrorMessage);
  }
};
