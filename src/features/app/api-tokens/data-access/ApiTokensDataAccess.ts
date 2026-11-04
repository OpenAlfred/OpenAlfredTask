'use server';

import 'server-only';
import { getServerSideUser } from '@/features/app/users/data-access/UsersDataAccess';
import {
  createServerErrorResponse,
  createServerSuccessResponse,
} from '@/features/shared/data-access/ServerResponse';
import { genericAwareOfInternalErrorMessage } from '@/features/shared/ui/error/errorMessages';
import { createApiTokenSchema } from '../domain/ApiTokensDomain';
import * as apiTokensService from '../service/ApiTokensService';

export interface ApiTokenDto {
  readonly id: string;
  readonly name: string;
  readonly prefix: string;
  readonly createdAt: Date;
  readonly lastUsedAt: Date | null;
  readonly expiresAt: Date | null;
}

export interface CreatedApiTokenDto {
  // The token in plain text. It can't be shown again.
  readonly token: string;
  readonly tokens: Array<ApiTokenDto>;
}

export const getApiTokens = async () => {
  try {
    const { id: userId } = await getServerSideUser();

    return createServerSuccessResponse(await apiTokensService.listApiTokens(userId));
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<Array<ApiTokenDto>>(genericAwareOfInternalErrorMessage);
  }
};

export const createApiToken = async (formData: FormData) => {
  const validation = createApiTokenSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    // return Zod validation errors.
    return createServerErrorResponse<CreatedApiTokenDto>(validation.error);
  }

  try {
    const { id: userId } = await getServerSideUser();
    const { name, expiresIn } = validation.data;

    const token = await apiTokensService.createApiToken(userId, { name, expiresInDays: expiresIn });
    const tokens = await apiTokensService.listApiTokens(userId);

    return createServerSuccessResponse<CreatedApiTokenDto>({ token, tokens });
  } catch (error) {
    if (error instanceof apiTokensService.ApiTokenLimitError) {
      return createServerErrorResponse<CreatedApiTokenDto>(error.message);
    }

    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<CreatedApiTokenDto>(genericAwareOfInternalErrorMessage);
  }
};

export const revokeApiToken = async (id: string) => {
  try {
    const { id: userId } = await getServerSideUser();

    await apiTokensService.revokeApiToken(userId, String(id));

    return createServerSuccessResponse(await apiTokensService.listApiTokens(userId));
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<Array<ApiTokenDto>>(genericAwareOfInternalErrorMessage);
  }
};
