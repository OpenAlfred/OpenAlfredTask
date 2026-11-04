import { ZodError } from 'zod';

export interface ServerError {
  readonly message: string;
}

export interface ServerResponse<ResponseData> {
  readonly errors?: Array<ServerError>;
  readonly data?: ResponseData;
}

/*
 * We cannot return plain Zod Error classes as they're not serializable.
 */
export const extractZodErrors = (error: ZodError) => {
  const errors: Array<ServerError> = error.issues.map(({ message }) => ({ message }));

  if (errors.length < 1) errors.push({ message: 'Unknown Zod error.' });
  return errors;
};
/**/

export const createServerErrorResponse = <ResponseData>(
  error: any,
): ServerResponse<ResponseData> => {
  if (typeof error === 'string') {
    return { errors: [{ message: error }] };
  } else if (error && Array.isArray(error.issues)) {
    // Zod error.
    return { errors: extractZodErrors(error) };
  } else if (error instanceof Error) {
    return { errors: [{ message: error.message }] };
  } else {
    return { errors: [{ message: 'Unknown server error.' }] };
  }
};

export const createServerSuccessResponse = <ResponseData>(
  data: ResponseData,
): ServerResponse<ResponseData> => ({ data });
