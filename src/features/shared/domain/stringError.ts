/*
 * Zod 4 replaced the required_error and invalid_type_error options with a single error function.
 * This keeps the two messages the schemas have always used: one when the value is missing, and
 * one when it's something other than a string.
 */
export const stringError = (required: string, invalidType: string) => ({
  error: (issue: { input?: unknown }) => (issue.input === undefined ? required : invalidType),
});
